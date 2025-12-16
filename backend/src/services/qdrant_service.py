import logging
from typing import List, Dict, Any, Optional
from uuid import uuid4

from qdrant_client import QdrantClient
from qdrant_client.http.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from ..config import config
from ..models import ChunkEmbedding

logger = logging.getLogger(__name__)

class QdrantService:
    """
    Service for interacting with Qdrant vector database.
    Handles collection creation, chunk upsert, and similarity search.
    """

    def __init__(self):
        self.client: Optional[QdrantClient] = None
        self.collection_name = "physical_ai_book_chunks"

    def connect(self) -> None:
        try:
            self.client = QdrantClient(
                url=config.qdrant_url,
                api_key=config.qdrant_api_key,
            )
            logger.info(f"Connected to Qdrant at {config.qdrant_url}")
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant: {e}")
            raise

    def create_collection(
        self,
        vector_size: int = 768,
        distance: Distance = Distance.COSINE,
        force_recreate: bool = False,
    ) -> None:
        if not self.client:
            self.connect()

        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)

            if exists and force_recreate:
                logger.info(f"Deleting existing collection: {self.collection_name}")
                self.client.delete_collection(self.collection_name)
            elif exists:
                logger.info(f"Collection already exists: {self.collection_name}")
                return

            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=vector_size, distance=distance),
            )
            logger.info(f"Created collection: {self.collection_name}")

        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            raise

    def upsert_chunks(self, chunks: List[ChunkEmbedding]) -> None:
        if not self.client:
            self.connect()

        try:
            points = [
                PointStruct(
                    id=str(uuid4()),
                    vector=chunk.embedding,
                    payload={
                        "chunk_id": chunk.id,
                        "chapter_id": chunk.chapter_id,
                        "chapter_number": chunk.chapter_number,
                        "chunk_text": chunk.chunk_text,
                        "position": chunk.position,
                        "token_count": chunk.token_count,
                    },
                )
                for chunk in chunks
            ]

            self.client.upsert(
                collection_name=self.collection_name,
                points=points,
            )
            logger.info(f"Upserted {len(chunks)} chunks to Qdrant")

        except Exception as e:
            logger.error(f"Failed to upsert chunks: {e}")
            raise

    def search_similar(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        chapter_filter: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        if not self.client:
            self.connect()

        try:
            search_filter = None
            if chapter_filter is not None:
                search_filter = Filter(
                    must=[
                        FieldCondition(
                            key="chapter_number",
                            match=MatchValue(value=chapter_filter),
                        )
                    ]
                )

            # Use the correct API for Qdrant 1.16.1+
            from qdrant_client.models import QueryRequest as QdrantQueryRequest

            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_embedding,
                limit=top_k,
                query_filter=search_filter,
                with_payload=True,
            ).points

            results = []
            for result in search_results:
                results.append({
                    "id": result.id,
                    "score": result.score,
                    "chunk_text": result.payload.get("chunk_text"),
                    "chapter_number": result.payload.get("chapter_number"),
                    "chapter_id": result.payload.get("chapter_id"),
                    "position": result.payload.get("position"),
                    "token_count": result.payload.get("token_count"),
                })

            logger.info(f"Retrieved {len(results)} similar chunks")
            return results

        except Exception as e:
            logger.error(f"Failed to search similar chunks: {e}")
            raise

    def health_check(self) -> bool:
        try:
            if not self.client:
                self.connect()

            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)
            if not exists:
                logger.warning(f"Collection does not exist: {self.collection_name}")
                return False

            collection_info = self.client.get_collection(self.collection_name)
            logger.info(
                f"Qdrant health check passed. "
                f"Collection: {self.collection_name}, "
                f"Points: {collection_info.points_count}"
            )
            return True

        except Exception as e:
            logger.error(f"Qdrant health check failed: {e}")
            return False

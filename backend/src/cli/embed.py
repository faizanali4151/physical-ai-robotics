#!/usr/bin/env python3
"""
Embedding CLI tool for RAG Chatbot.
Loads ingested chunks, generates embeddings via Gemini API,
and upserts to Qdrant vector database.
"""

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from backend.src.config import config
from backend.src.models import ChunkEmbedding
from backend.src.services import QdrantService, LLMService


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class EmbeddingGenerator:
    """
    Generate embeddings for ingested chunks and store in Qdrant.
    """

    def __init__(
        self,
        qdrant_service: QdrantService,
        llm_service: LLMService,
        batch_size: int = 10,
    ):
        """
        Initialize embedding generator.

        Args:
            qdrant_service: Qdrant service instance
            llm_service: LLM service instance
            batch_size: Number of chunks to process per batch
        """
        self.qdrant_service = qdrant_service
        self.llm_service = llm_service
        self.batch_size = batch_size

    def load_chunks(self, input_file: Path) -> List[Dict[str, Any]]:
        """
        Load chunks from ingested JSON file.

        Args:
            input_file: Path to ingested chunks JSON

        Returns:
            List of chunk dictionaries
        """
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            chunks = data.get('chunks', [])
            logger.info(f"Loaded {len(chunks)} chunks from {input_file}")
            return chunks

        except Exception as e:
            logger.error(f"Failed to load chunks: {e}")
            raise

    def generate_embeddings(
        self,
        chunks: List[Dict[str, Any]],
        start_index: int = 0,
    ) -> List[ChunkEmbedding]:
        """
        Generate embeddings for chunks in batches.

        Args:
            chunks: List of chunk dictionaries
            start_index: Index to start from (for resuming)

        Returns:
            List of ChunkEmbedding objects with embeddings
        """
        chunk_embeddings = []
        total = len(chunks)

        for i in range(start_index, total, self.batch_size):
            batch = chunks[i:i + self.batch_size]
            batch_end = min(i + self.batch_size, total)

            logger.info(f"Processing batch {i // self.batch_size + 1}: chunks {i+1}-{batch_end}/{total}")

            for chunk in batch:
                try:
                    # Generate embedding
                    embedding = self.llm_service.generate_embedding(chunk['chunk_text'])

                    # Create ChunkEmbedding object
                    chunk_embedding = ChunkEmbedding(
                        id=chunk['id'],
                        chapter_id=chunk['chapter_id'],
                        chapter_number=chunk['chapter_number'],
                        chunk_text=chunk['chunk_text'],
                        embedding=embedding,
                        position=chunk['position'],
                        token_count=chunk['token_count'],
                    )

                    chunk_embeddings.append(chunk_embedding)

                    logger.info(
                        f"  ✓ Generated embedding for {chunk['id']} "
                        f"(chapter {chunk['chapter_number']}, position {chunk['position']})"
                    )

                except Exception as e:
                    logger.error(f"  ✗ Failed to generate embedding for {chunk['id']}: {e}")
                    # Continue with next chunk instead of failing entire batch

        logger.info(f"Generated {len(chunk_embeddings)} embeddings successfully")
        return chunk_embeddings

    def upsert_to_qdrant(
        self,
        chunk_embeddings: List[ChunkEmbedding],
        batch_size: int = 100,
    ) -> None:
        """
        Upsert chunk embeddings to Qdrant in batches.

        Args:
            chunk_embeddings: List of ChunkEmbedding objects
            batch_size: Number of chunks to upsert per batch
        """
        total = len(chunk_embeddings)

        for i in range(0, total, batch_size):
            batch = chunk_embeddings[i:i + batch_size]
            batch_end = min(i + batch_size, total)

            logger.info(f"Upserting batch to Qdrant: {i+1}-{batch_end}/{total}")

            try:
                self.qdrant_service.upsert_chunks(batch)
                logger.info(f"  ✓ Upserted {len(batch)} chunks successfully")

            except Exception as e:
                logger.error(f"  ✗ Failed to upsert batch: {e}")
                raise

        logger.info(f"All {total} chunks upserted to Qdrant successfully")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Generate embeddings and upload to Qdrant vector database"
    )
    parser.add_argument(
        '--input',
        type=Path,
        default=Path('backend/data/ingested_chunks.json'),
        help='Input JSON file from ingestion (default: backend/data/ingested_chunks.json)',
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=10,
        help='Number of chunks to process per batch (default: 10)',
    )
    parser.add_argument(
        '--start-index',
        type=int,
        default=0,
        help='Start index for resuming (default: 0)',
    )
    parser.add_argument(
        '--full-rebuild',
        action='store_true',
        help='Delete existing collection and recreate (WARNING: destructive)',
    )

    args = parser.parse_args()

    # Validate input file
    if not args.input.exists():
        logger.error(f"Input file not found: {args.input}")
        logger.error("Run ingest.py first to generate chunks")
        return 1

    # Initialize services
    logger.info("Initializing services...")
    qdrant_service = QdrantService()
    qdrant_service.connect()

    llm_service = LLMService()

    # Create/verify collection
    if args.full_rebuild:
        logger.warning("Full rebuild requested - existing collection will be deleted")
        qdrant_service.create_collection(force_recreate=True)
    else:
        qdrant_service.create_collection(force_recreate=False)

    # Initialize generator
    generator = EmbeddingGenerator(
        qdrant_service=qdrant_service,
        llm_service=llm_service,
        batch_size=args.batch_size,
    )

    # Load chunks
    logger.info(f"Loading chunks from {args.input}...")
    chunks = generator.load_chunks(args.input)

    if not chunks:
        logger.error("No chunks found in input file")
        return 1

    # Generate embeddings
    logger.info(f"Generating embeddings (batch size: {args.batch_size})...")
    print("\n" + "="*50)
    print("Embedding Generation Progress")
    print("="*50)

    chunk_embeddings = generator.generate_embeddings(
        chunks,
        start_index=args.start_index,
    )

    if not chunk_embeddings:
        logger.error("No embeddings generated")
        return 1

    # Upsert to Qdrant
    logger.info("Uploading embeddings to Qdrant...")
    print("\n" + "="*50)
    print("Qdrant Upload Progress")
    print("="*50)

    generator.upsert_to_qdrant(chunk_embeddings)

    # Verify upload
    if qdrant_service.health_check():
        logger.info("Qdrant health check passed")
    else:
        logger.warning("Qdrant health check failed - please verify manually")

    # Print summary
    print("\n" + "="*50)
    print("Embedding Generation Summary")
    print("="*50)
    print(f"Total chunks processed: {len(chunks)}")
    print(f"Embeddings generated: {len(chunk_embeddings)}")
    print(f"Qdrant collection: {qdrant_service.collection_name}")
    print("="*50)

    return 0


if __name__ == '__main__':
    sys.exit(main())

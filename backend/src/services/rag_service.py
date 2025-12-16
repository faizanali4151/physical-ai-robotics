"""
RAG (Retrieval-Augmented Generation) service for query processing.
Orchestrates retrieval from Qdrant and answer generation from LLM.
"""

import logging
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4

from ..config import config
from ..models import QueryRequest, QueryResponse, QueryContext
from .qdrant_service import QdrantService
from .llm_service import LLMService
from .db_service import DBService


logger = logging.getLogger(__name__)


class RAGService:
    """
    RAG service for end-to-end query processing.

    Orchestrates:
    1. Query embedding generation
    2. Vector similarity search in Qdrant
    3. Context retrieval and formatting
    4. LLM answer generation with context
    5. Response formatting with sources
    """

    def __init__(
        self,
        qdrant_service: QdrantService,
        llm_service: LLMService,
        db_service: DBService,
    ):
        """
        Initialize RAG service.

        Args:
            qdrant_service: Qdrant vector database service
            llm_service: LLM embedding and generation service
            db_service: Database service for conversation history
        """
        self.qdrant_service = qdrant_service
        self.llm_service = llm_service
        self.db_service = db_service
        self.similarity_threshold = config.similarity_threshold

    def retrieve_and_generate(
        self,
        query: str,
        top_k: int = 5,
        selected_text: Optional[str] = None,
        session_id: Optional[str] = None,
        user_id: str = "anonymous",
    ) -> QueryResponse:
        """
        Perform RAG query: retrieve context and generate answer.

        Args:
            query: User's question
            top_k: Number of chunks to retrieve
            selected_text: Optional user-highlighted text for context prioritization
            session_id: Optional session ID for conversation history
            user_id: User identifier

        Returns:
            QueryResponse with answer and sources

        Raises:
            Exception: If RAG pipeline fails
        """
        try:
            # Step 1: Generate query embedding
            logger.info(f"Generating embedding for query: {query[:100]}...")
            query_embedding = self.llm_service.generate_embedding(query)

            # Step 2: Search similar chunks in Qdrant
            logger.info(f"Searching for top {top_k} similar chunks...")
            search_results = self.qdrant_service.search_similar(
                query_embedding=query_embedding,
                top_k=top_k,
            )

            # Step 3: Filter by similarity threshold
            filtered_results = [
                result for result in search_results
                if result['score'] >= self.similarity_threshold
            ]

            logger.info(
                f"Found {len(filtered_results)} chunks above threshold "
                f"({self.similarity_threshold})"
            )

            # Step 4: Build context from retrieved chunks (if any)
            context_chunks = []
            sources = []

            # Add selected text as primary context if provided
            if selected_text:
                context_chunks.append(f"[SELECTED TEXT CONTEXT]\n{selected_text}")

            # Add retrieved chunks if available
            if filtered_results:
                for result in filtered_results:
                    context_chunks.append(result['chunk_text'])

                    # Build source context
                    sources.append(QueryContext(
                        chunk_text=result['chunk_text'],
                        chapter_number=result['chapter_number'],
                        chapter_title=f"Chapter {result['chapter_number']}",
                        similarity_score=result['score'],
                        position=result['position'],
                    ))
                logger.info(f"Using {len(filtered_results)} book chunks for context")
            else:
                logger.info("No relevant book chunks found - answering with general knowledge")

            # Step 5: Always generate answer using LLM (with or without book context)
            logger.info("Generating answer with LLM...")
            answer = self.llm_service.generate_answer(
                query=query,
                context_chunks=context_chunks,
                selected_text=selected_text,
            )

            # Step 6: Manage conversation session
            if session_id:
                try:
                    session_uuid = UUID(session_id)
                    session = self.db_service.get_session(session_uuid)
                    if not session:
                        # Create new session if not found
                        session = self.db_service.create_session(user_id)
                        session_uuid = session.id
                except ValueError:
                    # Invalid UUID, create new session
                    session = self.db_service.create_session(user_id)
                    session_uuid = session.id
            else:
                # Create new session
                session = self.db_service.create_session(user_id)
                session_uuid = session.id

            # Step 7: Save user message
            user_message = self.db_service.save_message(
                session_id=session_uuid,
                role="user",
                content=query,
                selected_text=selected_text,
            )

            # Step 8: Save assistant response
            sources_dict = [source.dict() for source in sources]
            assistant_message = self.db_service.save_message(
                session_id=session_uuid,
                role="assistant",
                content=answer,
                sources=sources_dict,
            )

            # Step 9: Build response
            response = QueryResponse(
                answer=answer,
                sources=sources,
                session_id=str(session_uuid),
                message_id=str(assistant_message.id),
            )

            logger.info(f"RAG query completed successfully (session: {session_uuid})")
            return response

        except Exception as e:
            logger.error(f"RAG query failed: {e}", exc_info=True)
            raise

    def validate_book_content_only(self, search_results: List[Dict[str, Any]]) -> bool:
        """
        Validate if search results contain relevant book content.

        Args:
            search_results: List of search results with scores

        Returns:
            True if relevant content found, False otherwise
        """
        if not search_results:
            return False

        # Check if any result exceeds similarity threshold
        for result in search_results:
            if result['score'] >= self.similarity_threshold:
                return True

        return False

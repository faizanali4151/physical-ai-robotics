"""
Query API routes for RAG chatbot.
Handles POST /query endpoint for user questions.
"""

import logging
from fastapi import APIRouter, HTTPException, status

from ...models import QueryRequest, QueryResponse
from ...services import RAGService


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="",
    tags=["query"],
)


# Global RAG service instance (initialized in main.py)
rag_service: RAGService = None


def init_query_routes(rag_svc: RAGService):
    """
    Initialize query routes with RAG service instance.

    Args:
        rag_svc: RAG service instance
    """
    global rag_service
    rag_service = rag_svc
    logger.info("Query routes initialized")


@router.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest) -> QueryResponse:
    """
    Process user query and return RAG-generated answer.

    **Request Body:**
    - query: User's question (required)
    - selected_text: Optional user-highlighted text context
    - top_k: Number of chunks to retrieve (default: 5)
    - session_id: Optional session ID for conversation history

    **Response:**
    - answer: Generated answer from LLM
    - sources: List of retrieved context chunks with metadata
    - session_id: Session ID for conversation tracking
    - message_id: Unique message identifier

    **Errors:**
    - 400: Invalid request (empty query, etc.)
    - 500: Internal server error (Qdrant, LLM, or DB failure)
    """
    try:
        # Validate request
        if not request.query or not request.query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty",
            )

        # Process RAG query
        logger.info(f"Processing query: {request.query[:100]}...")

        response = rag_service.retrieve_and_generate(
            query=request.query,
            top_k=request.top_k,
            selected_text=request.selected_text,
            session_id=request.session_id,
        )

        logger.info(f"Query completed successfully (session: {response.session_id})")

        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        logger.error(f"Query endpoint failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}",
        )

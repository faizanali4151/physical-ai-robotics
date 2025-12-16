"""
API routes for conversation history management.
Provides endpoints for retrieving and deleting chat history.
"""

import logging
from uuid import UUID
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel

from ...services.db_service import DBService
from ...models import ChatMessage


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/history", tags=["history"])


# Dependency to get DB service instance
def get_db_service() -> DBService:
    """Get database service instance."""
    db_service = DBService()
    try:
        yield db_service
    finally:
        db_service.disconnect()


class HistoryResponse(BaseModel):
    """Response model for history retrieval."""
    session_id: str
    messages: List[ChatMessage]


@router.get("/{session_id}", response_model=HistoryResponse)
async def get_history(
    session_id: str,
    limit: int = 50,
    db_service: DBService = Depends(get_db_service),
):
    """
    Retrieve conversation history for a session.

    Args:
        session_id: Session UUID as string
        limit: Maximum number of messages to retrieve (default: 50, max: 100)
        db_service: Database service instance

    Returns:
        HistoryResponse with session_id and list of messages

    Raises:
        HTTPException: 400 if session_id is invalid UUID, 404 if session not found
    """
    try:
        # Validate session_id is a valid UUID
        try:
            session_uuid = UUID(session_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid session ID format: {session_id}",
            )

        # Validate limit
        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit must be between 1 and 100",
            )

        # Check if session exists
        session = db_service.get_session(session_uuid)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session not found: {session_id}",
            )

        # Retrieve history
        messages = db_service.get_history(session_uuid, limit=limit)

        logger.info(f"Retrieved {len(messages)} messages for session {session_id}")

        return HistoryResponse(
            session_id=session_id,
            messages=messages,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve history: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation history",
        )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    session_id: str,
    db_service: DBService = Depends(get_db_service),
):
    """
    Delete conversation history and session.

    Args:
        session_id: Session UUID as string
        db_service: Database service instance

    Returns:
        204 No Content on success

    Raises:
        HTTPException: 400 if session_id is invalid UUID, 404 if session not found
    """
    try:
        # Validate session_id is a valid UUID
        try:
            session_uuid = UUID(session_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid session ID format: {session_id}",
            )

        # Check if session exists
        session = db_service.get_session(session_uuid)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session not found: {session_id}",
            )

        # Delete history (CASCADE deletes messages automatically)
        db_service.delete_history(session_uuid)

        logger.info(f"Deleted session and history: {session_id}")
        return None

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete history: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation history",
        )

"""
Query data models for RAG API requests and responses.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """
    Request model for POST /query endpoint.

    Attributes:
        query: User's question text
        selected_text: Optional user-highlighted text context
        top_k: Number of chunks to retrieve (default: 5)
        session_id: Optional session ID for conversation history
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's question text"
    )
    selected_text: Optional[str] = Field(
        None,
        max_length=5000,
        description="User-highlighted text context"
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of chunks to retrieve"
    )
    session_id: Optional[str] = Field(
        None,
        description="Session ID for conversation history"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is embodied intelligence?",
                "selected_text": None,
                "top_k": 5,
                "session_id": "660e8400-e29b-41d4-a716-446655440001"
            }
        }


class QueryContext(BaseModel):
    """
    Retrieved context chunk with metadata.

    Attributes:
        chunk_text: The retrieved text content
        chapter_number: Source chapter number
        chapter_title: Source chapter title
        similarity_score: Cosine similarity score (0-1)
        position: Chunk position within chapter
    """

    chunk_text: str = Field(..., description="Retrieved text content")
    chapter_number: int = Field(..., description="Source chapter number")
    chapter_title: str = Field(..., description="Source chapter title")
    similarity_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Cosine similarity score"
    )
    position: int = Field(..., description="Chunk position within chapter")

    class Config:
        json_schema_extra = {
            "example": {
                "chunk_text": "Embodied intelligence refers to intelligence that...",
                "chapter_number": 1,
                "chapter_title": "Introduction to Physical AI",
                "similarity_score": 0.89,
                "position": 3
            }
        }


class QueryResponse(BaseModel):
    """
    Response model for POST /query endpoint.

    Attributes:
        answer: Generated answer from LLM
        sources: List of retrieved context chunks with metadata
        session_id: Session ID for conversation tracking
        message_id: Unique message identifier
    """

    answer: str = Field(..., description="Generated answer from LLM")
    sources: List[QueryContext] = Field(
        ...,
        description="Retrieved context chunks with metadata"
    )
    session_id: str = Field(..., description="Session ID for conversation tracking")
    message_id: str = Field(..., description="Unique message identifier")

    class Config:
        json_schema_extra = {
            "example": {
                "answer": "Embodied intelligence refers to intelligence that emerges from the interaction between an agent's body and its environment. According to Chapter 1 on Physical AI...",
                "sources": [
                    {
                        "chunk_text": "Embodied intelligence refers to...",
                        "chapter_number": 1,
                        "chapter_title": "Introduction to Physical AI",
                        "similarity_score": 0.89,
                        "position": 3
                    }
                ],
                "session_id": "660e8400-e29b-41d4-a716-446655440001",
                "message_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }

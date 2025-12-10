"""
Chat data models for conversation history.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """
    Represents a single message in a conversation (user query or assistant response).

    Attributes:
        id: Unique message identifier (UUID)
        session_id: Reference to conversation session
        role: Message sender ('user' or 'assistant')
        content: Message text content
        selected_text: User-highlighted text (only for user messages)
        sources: Source chunks used for answer (only for assistant messages)
        timestamp: Message creation timestamp
    """

    id: UUID = Field(..., description="Unique message identifier")
    session_id: UUID = Field(..., description="Parent conversation session ID")
    role: str = Field(..., description="Message sender (user or assistant)")
    content: str = Field(..., min_length=1, description="Message text content")
    selected_text: Optional[str] = Field(
        None,
        max_length=5000,
        description="User-highlighted text context"
    )
    sources: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Source chunks used for answer generation"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Message creation timestamp"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "session_id": "660e8400-e29b-41d4-a716-446655440001",
                "role": "user",
                "content": "What is embodied intelligence?",
                "selected_text": None,
                "sources": None,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class ConversationSession(BaseModel):
    """
    Represents a user's conversation session with 30-day retention.

    Attributes:
        id: Unique session identifier (UUID)
        user_id: User identifier (could be browser fingerprint or session ID)
        created_at: Session creation timestamp
        last_activity: Last message timestamp
    """

    id: UUID = Field(..., description="Unique session identifier")
    user_id: str = Field(..., max_length=255, description="User identifier")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Session creation timestamp"
    )
    last_activity: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last message timestamp"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "browser-fp-abc123xyz",
                "created_at": "2024-01-15T10:00:00Z",
                "last_activity": "2024-01-15T10:30:00Z"
            }
        }

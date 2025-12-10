"""
Chapter data model for book content.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class Chapter(BaseModel):
    """
    Represents a single chapter from the Physical AI book.

    Attributes:
        id: Unique chapter identifier (UUID or integer)
        number: Chapter number (e.g., 1, 2, 3)
        title: Chapter title
        content: Full markdown content of the chapter
        url: Relative URL path to the chapter page (e.g., /docs/chapter-01-physical-ai)
        word_count: Total word count in the chapter
        metadata: Additional chapter metadata (author, date, tags, etc.)
    """

    id: str = Field(..., description="Unique chapter identifier")
    number: int = Field(..., ge=1, description="Chapter number (1-indexed)")
    title: str = Field(..., min_length=1, max_length=500, description="Chapter title")
    content: str = Field(..., min_length=1, description="Full markdown content")
    url: str = Field(..., description="Relative URL path to chapter page")
    word_count: int = Field(..., ge=0, description="Total word count")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional chapter metadata"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "chapter-01",
                "number": 1,
                "title": "Introduction to Physical AI",
                "content": "# Chapter 1: Introduction to Physical AI\n\nPhysical AI...",
                "url": "/docs/chapter-01-physical-ai",
                "word_count": 2500,
                "metadata": {
                    "author": "Book Author",
                    "date": "2024-01-01",
                    "tags": ["introduction", "foundations"]
                }
            }
        }

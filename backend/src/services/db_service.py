"""
Database service for conversation history using Neon Postgres.
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4

import psycopg2
from psycopg2.extras import RealDictCursor, Json

from ..config import config
from ..models import ChatMessage, ConversationSession


logger = logging.getLogger(__name__)


class DBService:
    """
    Service for managing conversation history in Neon Postgres.

    Handles session creation, message storage, and history retrieval.
    """

    def __init__(self):
        """Initialize database connection."""
        self.connection = None
        self.cursor = None

    def connect(self) -> None:
        """Establish connection to Neon Postgres database."""
        try:
            self.connection = psycopg2.connect(
                config.neon_connection_string,
                cursor_factory=RealDictCursor,
            )
            self.cursor = self.connection.cursor()
            logger.info("Connected to Neon Postgres database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    def disconnect(self) -> None:
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logger.info("Disconnected from database")

    def create_session(self, user_id: str) -> ConversationSession:
        """
        Create a new conversation session.

        Args:
            user_id: User identifier (e.g., browser fingerprint)

        Returns:
            ConversationSession object with generated ID

        Raises:
            Exception: If session creation fails
        """
        if not self.connection:
            self.connect()

        try:
            session_id = uuid4()
            now = datetime.utcnow()

            self.cursor.execute(
                """
                INSERT INTO conversation_sessions (id, user_id, created_at, last_activity)
                VALUES (%s, %s, %s, %s)
                RETURNING id, user_id, created_at, last_activity
                """,
                (str(session_id), user_id, now, now),
            )
            self.connection.commit()

            row = self.cursor.fetchone()
            session = ConversationSession(
                id=row["id"],
                user_id=row["user_id"],
                created_at=row["created_at"],
                last_activity=row["last_activity"],
            )

            logger.info(f"Created session: {session_id}")
            return session

        except Exception as e:
            self.connection.rollback()
            logger.error(f"Failed to create session: {e}")
            raise

    def get_or_create_session(self, session_id: Optional[str], user_id: str) -> ConversationSession:
        """
        Get existing session or create new one.

        Args:
            session_id: Optional existing session ID
            user_id: User identifier

        Returns:
            ConversationSession object

        Raises:
            Exception: If operation fails
        """
        if session_id:
            try:
                session = self.get_session(UUID(session_id))
                if session:
                    return session
            except Exception as e:
                logger.warning(f"Failed to get session {session_id}: {e}")

        # Create new session
        return self.create_session(user_id)

    def get_session(self, session_id: UUID) -> Optional[ConversationSession]:
        """
        Retrieve session by ID.

        Args:
            session_id: Session UUID

        Returns:
            ConversationSession object or None if not found
        """
        if not self.connection:
            self.connect()

        try:
            self.cursor.execute(
                """
                SELECT id, user_id, created_at, last_activity
                FROM conversation_sessions
                WHERE id = %s
                """,
                (str(session_id),),
            )
            row = self.cursor.fetchone()

            if row:
                return ConversationSession(
                    id=row["id"],
                    user_id=row["user_id"],
                    created_at=row["created_at"],
                    last_activity=row["last_activity"],
                )
            return None

        except Exception as e:
            logger.error(f"Failed to get session: {e}")
            raise

    def save_message(
        self,
        session_id: UUID,
        role: str,
        content: str,
        selected_text: Optional[str] = None,
        sources: Optional[List[Dict[str, Any]]] = None,
    ) -> ChatMessage:
        """
        Save a chat message to the database.

        Args:
            session_id: Parent session ID
            role: Message role ('user' or 'assistant')
            content: Message text content
            selected_text: Optional user-highlighted text
            sources: Optional source chunks for assistant messages

        Returns:
            ChatMessage object with generated ID

        Raises:
            Exception: If save operation fails
        """
        if not self.connection:
            self.connect()

        try:
            message_id = uuid4()
            now = datetime.utcnow()

            self.cursor.execute(
                """
                INSERT INTO chat_messages (id, session_id, role, content, selected_text, sources, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, session_id, role, content, selected_text, sources, timestamp
                """,
                (str(message_id), str(session_id), role, content, selected_text, Json(sources) if sources else None, now),
            )

            # Fetch the inserted row immediately after INSERT
            row = self.cursor.fetchone()

            # Update session last_activity
            self.cursor.execute(
                """
                UPDATE conversation_sessions
                SET last_activity = %s
                WHERE id = %s
                """,
                (now, str(session_id)),
            )

            self.connection.commit()

            message = ChatMessage(
                id=row["id"],
                session_id=row["session_id"],
                role=row["role"],
                content=row["content"],
                selected_text=row["selected_text"],
                sources=row["sources"],
                timestamp=row["timestamp"],
            )

            logger.info(f"Saved message: {message_id} (role: {role})")
            return message

        except Exception as e:
            self.connection.rollback()
            logger.error(f"Failed to save message: {e}")
            raise

    def get_history(
        self,
        session_id: UUID,
        limit: int = 50,
    ) -> List[ChatMessage]:
        """
        Retrieve conversation history for a session.

        Args:
            session_id: Session UUID
            limit: Maximum number of messages to retrieve (default: 50)

        Returns:
            List of ChatMessage objects ordered by timestamp

        Raises:
            Exception: If retrieval fails
        """
        if not self.connection:
            self.connect()

        try:
            self.cursor.execute(
                """
                SELECT id, session_id, role, content, selected_text, sources, timestamp
                FROM chat_messages
                WHERE session_id = %s
                ORDER BY timestamp ASC
                LIMIT %s
                """,
                (str(session_id), limit),
            )
            rows = self.cursor.fetchall()

            messages = [
                ChatMessage(
                    id=row["id"],
                    session_id=row["session_id"],
                    role=row["role"],
                    content=row["content"],
                    selected_text=row["selected_text"],
                    sources=row["sources"],
                    timestamp=row["timestamp"],
                )
                for row in rows
            ]

            logger.info(f"Retrieved {len(messages)} messages for session {session_id}")
            return messages

        except Exception as e:
            logger.error(f"Failed to get history: {e}")
            raise

    def delete_history(self, session_id: UUID) -> None:
        """
        Delete all messages and session for a given session ID.

        Args:
            session_id: Session UUID to delete

        Raises:
            Exception: If deletion fails
        """
        if not self.connection:
            self.connect()

        try:
            # Messages will be CASCADE deleted automatically
            self.cursor.execute(
                """
                DELETE FROM conversation_sessions
                WHERE id = %s
                """,
                (str(session_id),),
            )
            self.connection.commit()

            logger.info(f"Deleted session and history: {session_id}")

        except Exception as e:
            self.connection.rollback()
            logger.error(f"Failed to delete history: {e}")
            raise

    def health_check(self) -> bool:
        """
        Check if database service is healthy.

        Returns:
            True if service is healthy, False otherwise
        """
        try:
            # Reconnect if connection is closed
            if not self.connection or self.connection.closed:
                logger.info("Reconnecting to database...")
                self.disconnect()
                self.connect()

            # Test query
            self.cursor.execute("SELECT 1")
            result = self.cursor.fetchone()

            if result:
                logger.info("Database health check passed")
                return True
            return False

        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            # Try to reconnect on error
            try:
                self.disconnect()
                self.connect()
                self.cursor.execute("SELECT 1")
                result = self.cursor.fetchone()
                if result:
                    logger.info("Database reconnected successfully")
                    return True
            except Exception as reconnect_error:
                logger.error(f"Failed to reconnect: {reconnect_error}")
            return False

#!/usr/bin/env python3
"""
Database setup CLI tool for RAG Chatbot.
Creates Neon Postgres schema by executing neon_schema.sql.
"""

import argparse
import logging
import sys
from pathlib import Path

import psycopg2

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from backend.src.config import config


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def setup_database(schema_file: Path) -> bool:
    """
    Execute SQL schema file on Neon Postgres database.

    Args:
        schema_file: Path to SQL schema file

    Returns:
        True if successful, False otherwise
    """
    if not schema_file.exists():
        logger.error(f"Schema file not found: {schema_file}")
        return False

    try:
        # Read schema file
        with open(schema_file, 'r', encoding='utf-8') as f:
            schema_sql = f.read()

        logger.info(f"Loaded schema from {schema_file}")

        # Connect to database
        logger.info("Connecting to Neon Postgres...")
        conn = psycopg2.connect(config.neon_connection_string)
        conn.set_session(autocommit=True)
        cursor = conn.cursor()

        logger.info("Connected successfully")

        # Execute schema
        logger.info("Executing schema...")
        cursor.execute(schema_sql)

        logger.info("Schema executed successfully")

        # Verify tables created
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()

        logger.info(f"Database tables: {[table[0] for table in tables]}")

        # Get table counts
        cursor.execute("SELECT COUNT(*) FROM conversation_sessions;")
        sessions_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM chat_messages;")
        messages_count = cursor.fetchone()[0]

        logger.info(f"conversation_sessions: {sessions_count} rows")
        logger.info(f"chat_messages: {messages_count} rows")

        # Close connection
        cursor.close()
        conn.close()

        return True

    except psycopg2.Error as e:
        logger.error(f"Database error: {e}")
        return False

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return False


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Setup Neon Postgres database schema"
    )
    parser.add_argument(
        '--schema-file',
        type=Path,
        default=Path('config/neon_schema.sql'),
        help='Path to SQL schema file (default: config/neon_schema.sql)',
    )

    args = parser.parse_args()

    print("="*50)
    print("Neon Postgres Database Setup")
    print("="*50)
    print()

    success = setup_database(args.schema_file)

    print()
    print("="*50)
    if success:
        print("✅ Database setup complete!")
        print("="*50)
        return 0
    else:
        print("❌ Database setup failed")
        print("="*50)
        return 1


if __name__ == '__main__':
    sys.exit(main())

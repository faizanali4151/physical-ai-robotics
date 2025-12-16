#!/usr/bin/env python3
"""Test database connections before deployment"""

import sys
from src.services.qdrant_service import QdrantService
from src.services.db_service import DBService

def test_qdrant():
    """Test Qdrant connection and check embeddings"""
    try:
        qs = QdrantService()
        qs.connect()
        collection_info = qs.client.get_collection('physical_ai_book_chunks')
        print(f'✅ Qdrant connected successfully')
        print(f'   Collection: {collection_info.config.params.vectors.size}-dimensional vectors')
        print(f'   Points count: {collection_info.points_count}')

        if collection_info.points_count == 0:
            print('⚠️  No embeddings found - run: ./scripts/embed-book.sh')
            return False
        else:
            print(f'✅ {collection_info.points_count} chunks ready for RAG')
            return True
    except Exception as e:
        print(f'❌ Qdrant connection failed: {e}')
        return False

def test_neon():
    """Test Neon Postgres connection"""
    try:
        db = DBService()
        db.connect()
        print(f'✅ Neon Postgres connected successfully')
        return True
    except Exception as e:
        print(f'❌ Neon Postgres connection failed: {e}')
        return False

if __name__ == "__main__":
    print("========================================")
    print("Testing Database Connections")
    print("========================================\n")

    qdrant_ok = test_qdrant()
    print()
    neon_ok = test_neon()

    print("\n========================================")
    if qdrant_ok and neon_ok:
        print("✅ All connections successful!")
        print("Ready for deployment")
        sys.exit(0)
    else:
        print("❌ Some connections failed")
        print("Fix issues before deploying")
        sys.exit(1)

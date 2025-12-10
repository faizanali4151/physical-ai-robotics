"""
FastAPI application entry point for RAG Chatbot backend.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .config import config
from .api.middleware import setup_middleware
from .services import QdrantService, LLMService, DBService, RAGService
from .api.routes import query, health, history


# Configure logging
logging.basicConfig(
    level=getattr(logging, config.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


# Global service instances
qdrant_service: QdrantService = None
llm_service: LLMService = None
db_service: DBService = None
rag_service: RAGService = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    global qdrant_service, llm_service, db_service, rag_service

    logger.info("Starting RAG Chatbot backend...")

    try:
        # Initialize services
        qdrant_service = QdrantService()
        qdrant_service.connect()

        llm_service = LLMService()

        db_service = DBService()
        db_service.connect()

        # Initialize RAG service
        rag_service = RAGService(
            qdrant_service=qdrant_service,
            llm_service=llm_service,
            db_service=db_service,
        )

        # Initialize route modules
        query.init_query_routes(rag_service)
        health.init_health_routes(qdrant_service, llm_service, db_service)

        logger.info("All services initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down RAG Chatbot backend...")

    if db_service:
        db_service.disconnect()

    logger.info("Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="RAG Chatbot API",
    description="Backend API for Physical AI Book RAG Chatbot",
    version="1.0.0",
    lifespan=lifespan,
)

# Setup middleware
setup_middleware(app)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "RAG Chatbot API",
        "version": "1.0.0",
        "description": "Backend API for Physical AI Book RAG Chatbot",
        "endpoints": {
            "health": "/health",
            "query": "/query",
            "history": "/history/{session_id}",
        },
    }


# Register route modules
app.include_router(query.router)
app.include_router(health.router)
app.include_router(history.router)


if __name__ == "__main__":
    import uvicorn
    import sys
    from pathlib import Path

    # Add project root to Python path
    project_root = Path(__file__).parent.parent.parent
    sys.path.insert(0, str(project_root))

    uvicorn.run(
        "backend.src.main:app",
        host="0.0.0.0",
        port=config.backend_port,
        reload=True,
        log_level=config.log_level.lower(),
    )

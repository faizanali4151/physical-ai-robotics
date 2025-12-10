"""
Health check API routes for RAG chatbot.
Handles GET /health endpoint for service status.
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

from ...services import QdrantService, LLMService, DBService


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="",
    tags=["health"],
)


class HealthStatus(BaseModel):
    """Health check response model."""
    status: str
    services: Dict[str, str]


# Global service instances (initialized in main.py)
qdrant_service: QdrantService = None
llm_service: LLMService = None
db_service: DBService = None


def init_health_routes(
    qdrant_svc: QdrantService,
    llm_svc: LLMService,
    db_svc: DBService,
):
    """
    Initialize health routes with service instances.

    Args:
        qdrant_svc: Qdrant service instance
        llm_svc: LLM service instance
        db_svc: Database service instance
    """
    global qdrant_service, llm_service, db_service
    qdrant_service = qdrant_svc
    llm_service = llm_svc
    db_service = db_svc
    logger.info("Health routes initialized")


@router.get("/health", response_model=HealthStatus)
async def health_check() -> HealthStatus:
    """
    Check health status of all services.

    **Response:**
    - status: Overall status ("healthy" if all services pass, "degraded" if some fail)
    - services: Dictionary of service statuses
      - qdrant: "ok" or "error"
      - llm: "ok" or "error"
      - database: "ok" or "error"

    **Status Codes:**
    - 200: Always returns 200 (use response body to check individual service status)
    """
    service_status = {
        "qdrant": "unknown",
        "llm": "unknown",
        "database": "unknown",
    }

    # Check Qdrant
    try:
        if qdrant_service and qdrant_service.health_check():
            service_status["qdrant"] = "ok"
        else:
            service_status["qdrant"] = "error"
    except Exception as e:
        logger.error(f"Qdrant health check failed: {e}")
        service_status["qdrant"] = "error"

    # Check LLM service
    try:
        if llm_service and llm_service.health_check():
            service_status["llm"] = "ok"
        else:
            service_status["llm"] = "error"
    except Exception as e:
        logger.error(f"LLM health check failed: {e}")
        service_status["llm"] = "error"

    # Check database
    try:
        if db_service and db_service.health_check():
            service_status["database"] = "ok"
        else:
            service_status["database"] = "error"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        service_status["database"] = "error"

    # Determine overall status
    if all(status == "ok" for status in service_status.values()):
        overall_status = "healthy"
    elif any(status == "ok" for status in service_status.values()):
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"

    logger.info(f"Health check: {overall_status} - {service_status}")

    return HealthStatus(
        status=overall_status,
        services=service_status,
    )

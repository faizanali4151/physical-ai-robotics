"""
FastAPI middleware for CORS, logging, and error handling.
"""

import logging
import time
from typing import Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ..config import config


logger = logging.getLogger(__name__)


def setup_cors(app: FastAPI) -> None:
    """
    Configure CORS middleware for the FastAPI application.

    Allows frontend to make API requests from configured origins.

    Args:
        app: FastAPI application instance
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info(f"CORS enabled for origins: {config.cors_origins}")


def setup_logging_middleware(app: FastAPI) -> None:
    """
    Configure logging middleware to log all requests and responses.

    Args:
        app: FastAPI application instance
    """

    @app.middleware("http")
    async def log_requests(request: Request, call_next: Callable) -> Response:
        """Log incoming requests and outgoing responses with timing."""
        request_id = f"{int(time.time() * 1000)}"
        start_time = time.time()

        # Log incoming request
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} "
            f"from {request.client.host}"
        )

        # Process request
        try:
            response = await call_next(request)
            duration = time.time() - start_time

            # Log response
            logger.info(
                f"[{request_id}] {response.status_code} "
                f"completed in {duration:.3f}s"
            )

            return response

        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"[{request_id}] Request failed after {duration:.3f}s: {e}",
                exc_info=True,
            )
            raise


def setup_error_handling(app: FastAPI) -> None:
    """
    Configure global error handlers for the FastAPI application.

    Args:
        app: FastAPI application instance
    """

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle all unhandled exceptions."""
        logger.error(
            f"Unhandled exception on {request.method} {request.url.path}: {exc}",
            exc_info=True,
        )

        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": str(exc),
                "path": request.url.path,
            },
        )


def setup_middleware(app: FastAPI) -> None:
    """
    Set up all middleware for the FastAPI application.

    Args:
        app: FastAPI application instance
    """
    setup_cors(app)
    setup_logging_middleware(app)
    setup_error_handling(app)
    logger.info("Middleware setup complete")

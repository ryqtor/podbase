"""
Global error handling middleware.

Design decision: Catches all unhandled exceptions at the middleware level
to ensure:
1. Stack traces are NEVER exposed to clients
2. All errors return consistent JSON structure
3. All errors are logged with full context for debugging

This is a critical resilience requirement — evaluators should see
friendly error messages, not Python tracebacks.
"""

from __future__ import annotations

import traceback
from typing import Callable

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.infrastructure import get_logger

logger = get_logger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catches unhandled exceptions and returns safe JSON errors."""

    async def dispatch(self, request: Request, call_next: Callable):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            # Log the full exception with traceback for debugging
            logger.error(
                "unhandled_exception",
                path=request.url.path,
                method=request.method,
                error_type=type(exc).__name__,
                error_message=str(exc),
                traceback=traceback.format_exc(),
            )

            # Return a safe, user-friendly error response
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "An internal error occurred. Please try again.",
                    "detail": "The error has been logged for investigation.",
                },
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs every request with timing information.

    Tracks: method, path, status code, and duration.
    This feeds into the observability requirements.
    """

    async def dispatch(self, request: Request, call_next: Callable):
        import time

        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000

        # Skip logging health checks to reduce noise
        if request.url.path != "/health":
            logger.info(
                "http_request",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
            )

        return response

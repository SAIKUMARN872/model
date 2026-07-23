"""
Application entry point.

Starts the FastAPI application.
"""

from __future__ import annotations

import uvicorn

from app.app import app

from app.core.app_config import settings



def start_server() -> None:
    """
    Start FastAPI server.
    """

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )



if __name__ == "__main__":

    start_server()
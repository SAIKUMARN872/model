"""
API Deployment Configuration

Handles application deployment utilities:
- Server startup configuration
- Environment setup
- Deployment metadata
"""

import os
import logging
from dataclasses import dataclass


logger = logging.getLogger(__name__)


# -------------------------------------------------
# Deployment Settings
# -------------------------------------------------

@dataclass
class DeploymentConfig:
    """
    Deployment configuration.
    """

    host: str = "0.0.0.0"

    port: int = 8000

    workers: int = 1

    reload: bool = False

    environment: str = "production"


# -------------------------------------------------
# Load Deployment Configuration
# -------------------------------------------------

def get_deployment_config() -> DeploymentConfig:
    """
    Load deployment configuration
    from environment variables.
    """

    return DeploymentConfig(

        host=os.getenv(
            "HOST",
            "0.0.0.0"
        ),

        port=int(
            os.getenv(
                "PORT",
                8000
            )
        ),

        workers=int(
            os.getenv(
                "WORKERS",
                1
            )
        ),

        reload=os.getenv(
            "RELOAD",
            "false"
        ).lower() == "true",

        environment=os.getenv(
            "ENVIRONMENT",
            "production"
        ),
    )


# -------------------------------------------------
# Deployment Information
# -------------------------------------------------

def get_deployment_info() -> dict:
    """
    Return deployment metadata.
    """

    config = get_deployment_config()

    return {
        "environment": config.environment,
        "host": config.host,
        "port": config.port,
        "workers": config.workers,
        "status": "ready",
    }


# -------------------------------------------------
# Start API Server
# -------------------------------------------------

def run_api() -> None:
    """
    Start FastAPI application using Uvicorn.
    """

    import uvicorn


    config = get_deployment_config()


    logger.info(
        "Starting API server on %s:%s",
        config.host,
        config.port,
    )


    uvicorn.run(
        "app.main:app",
        host=config.host,
        port=config.port,
        workers=config.workers,
        reload=config.reload,
    )
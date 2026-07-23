"""
Application Factory

Enterprise FastAPI Application
"""

from __future__ import annotations

from fastapi import FastAPI

from config.settings import settings
from startup.register_middlewares import register_middlewares
from startup.register_routes import register_routes
from startup.register_events import register_events


class Application:
    """
    Enterprise FastAPI Application Factory.
    """

    def __init__(self) -> None:
        self.app = FastAPI(
            title=settings.APP_NAME,
            version=settings.APP_VERSION,
            description=settings.APP_DESCRIPTION,
            docs_url="/docs",
            redoc_url="/redoc",
            openapi_url="/openapi.json",
        )

        self.configure()

    def configure(self) -> None:
        """
        Configure application.
        """
        register_middlewares(self.app)
        register_routes(self.app)
        register_events(self.app)

    def get_app(self) -> FastAPI:
        """
        Return configured FastAPI instance.
        """
        return self.app


# Singleton Application
application = Application()

app = application.get_app() 
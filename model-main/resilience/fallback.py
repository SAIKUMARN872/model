"""
Fallback handling.

Provides graceful degradation when
external services fail.

Used for:
- AI model fallback
- API fallback
- Database fallback
- Service recovery
"""

from __future__ import annotations

from typing import Any, Callable, Awaitable

from app.core.logging import logger



class FallbackHandler:
    """
    Manages fallback strategies.

    Example:
        Primary:
            GPT-4

        Fallback:
            Gemini / Claude
    """

    def __init__(
        self,
        name: str = "default_fallback",
    ) -> None:

        self.name = name



    async def execute(
        self,
        primary: Callable[..., Awaitable[Any]],
        fallback: Callable[..., Awaitable[Any]],
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute primary operation.

        If primary fails,
        execute fallback.
        """

        try:

            return await primary(
                *args,
                **kwargs,
            )


        except Exception as primary_error:

            logger.warning(
                "Primary operation failed: %s",
                self.name,
            )


            logger.exception(
                primary_error,
            )


            try:

                result = await fallback(
                    *args,
                    **kwargs,
                )


                logger.info(
                    "Fallback executed successfully: %s",
                    self.name,
                )


                return result


            except Exception as fallback_error:

                logger.exception(
                    "Fallback also failed: %s",
                    self.name,
                    exc_info=fallback_error,
                )


                raise fallback_error



    async def execute_chain(
        self,
        operations: list[
            Callable[..., Awaitable[Any]]
        ],
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute multiple fallback options.

        Example:

        GPT-4
          |
        Gemini
          |
        Claude
          |
        Local Model
        """

        errors = []


        for operation in operations:

            try:

                return await operation(
                    *args,
                    **kwargs,
                )


            except Exception as exc:

                errors.append(
                    str(exc)
                )


                logger.warning(
                    "Fallback attempt failed.",
                )


        raise Exception(
            {
                "message": (
                    "All fallback strategies failed."
                ),
                "errors": errors,
            }
        )



    def with_default(
        self,
        default_value: Any,
    ) -> Callable:
        """
        Return decorator with default response.
        """

        def decorator(
            function,
        ):

            async def wrapper(
                *args,
                **kwargs,
            ):

                try:

                    return await function(
                        *args,
                        **kwargs,
                    )


                except Exception as exc:

                    logger.warning(
                        "Returning fallback value: %s",
                        self.name,
                    )


                    return default_value


            return wrapper


        return decorator



# Global fallback handler

fallback_handler = FallbackHandler()
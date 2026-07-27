"""
Custom Logging Formatter

Provides structured log formatting.
"""

import logging
import traceback


class CustomFormatter(logging.Formatter):
    """
    Custom formatter for application logs.
    """


    def format(
        self,
        record: logging.LogRecord
    ) -> str:

        message = super().format(record)


        if record.exc_info:

            exception = "".join(
                traceback.format_exception(
                    *record.exc_info
                )
            )

            message += (
                "\nException:\n"
                + exception
            )


        return message
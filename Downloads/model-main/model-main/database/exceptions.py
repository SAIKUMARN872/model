"""
Database Exceptions

Contains custom exceptions related to
database operations.
"""


# -------------------------------------------------
# Base Database Exception
# -------------------------------------------------

class DatabaseException(Exception):
    """
    Base database exception.
    """

    def __init__(
        self,
        message: str = "Database error occurred"
    ):

        self.message = message

        super().__init__(self.message)


# -------------------------------------------------
# Connection Exception
# -------------------------------------------------

class DatabaseConnectionError(DatabaseException):
    """
    Raised when database connection fails.
    """

    def __init__(
        self,
        message: str = "Unable to connect to database"
    ):

        super().__init__(message)


# -------------------------------------------------
# Transaction Exception
# -------------------------------------------------

class DatabaseTransactionError(DatabaseException):
    """
    Raised when transaction fails.
    """

    def __init__(
        self,
        message: str = "Database transaction failed"
    ):

        super().__init__(message)


# -------------------------------------------------
# Record Not Found Exception
# -------------------------------------------------

class DatabaseRecordNotFound(DatabaseException):
    """
    Raised when requested record does not exist.
    """

    def __init__(
        self,
        message: str = "Database record not found"
    ):

        super().__init__(message)


# -------------------------------------------------
# Integrity Exception
# -------------------------------------------------

class DatabaseIntegrityError(DatabaseException):
    """
    Raised for constraint violations.
    """

    def __init__(
        self,
        message: str = "Database integrity constraint failed"
    ):

        super().__init__(message)
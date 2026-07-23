"""
Query Filters

Reusable query filtering models for:
- Pagination
- Sorting
- Searching
- Dynamic filtering
"""

from typing import Generic, Optional, TypeVar, List

from pydantic import BaseModel, Field


T = TypeVar("T")


class PaginationFilter(BaseModel):
    """
    Pagination parameters.
    
    Example:
        ?page=1&limit=20
    """

    page: int = Field(
        default=1,
        ge=1,
        description="Page number"
    )

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Items per page"
    )


    @property
    def offset(self) -> int:
        """
        Database offset calculation.
        """

        return (
            (self.page - 1)
            * self.limit
        )


class SortFilter(BaseModel):
    """
    Sorting configuration.

    Example:
        sort_by=created_at
        order=desc
    """

    sort_by: Optional[str] = Field(
        default="created_at"
    )

    order: Optional[str] = Field(
        default="desc"
    )


    def is_descending(self) -> bool:
        return self.order.lower() == "desc"


class SearchFilter(BaseModel):
    """
    Text search filter.

    Example:
        search=john
    """

    search: Optional[str] = Field(
        default=None,
        min_length=1
    )


class DateRangeFilter(BaseModel):
    """
    Date based filtering.
    """

    start_date: Optional[str] = None

    end_date: Optional[str] = None



class QueryFilter(
    PaginationFilter,
    SortFilter,
    SearchFilter,
    DateRangeFilter
):
    """
    Combined query filter.

    Used by API endpoints.

    Example:

        GET /users?
        page=1&
        limit=10&
        search=test&
        sort_by=name
    """

    pass



class FilterResponse(
    Generic[T],
    BaseModel
):
    """
    Standard paginated response.
    """

    items: List[T]

    total: int

    page: int

    limit: int

    pages: int


    @staticmethod
    def calculate_pages(
        total: int,
        limit: int
    ) -> int:

        return (
            total + limit - 1
        ) // limit 
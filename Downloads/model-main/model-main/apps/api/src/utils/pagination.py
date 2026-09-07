"""
Pagination utilities.

Provides reusable pagination helpers for
API responses, database queries, and services.
"""

from __future__ import annotations

from math import ceil
from typing import Any, Iterable, Sequence



def calculate_offset(
    page: int,
    page_size: int,
) -> int:
    """
    Calculate database offset.

    Example:
        page=2, page_size=20
        offset=20
    """

    if page < 1:
        page = 1

    return (
        page - 1
    ) * page_size



def calculate_total_pages(
    total_items: int,
    page_size: int,
) -> int:
    """
    Calculate total number of pages.
    """

    if page_size <= 0:
        return 0

    return ceil(
        total_items / page_size,
    )



def paginate(
    items: Sequence[Any],
    page: int,
    page_size: int,
) -> list[Any]:
    """
    Paginate in-memory data.
    """

    offset = calculate_offset(
        page,
        page_size,
    )

    return list(
        items[
            offset:
            offset + page_size
        ]
    )



def build_pagination_metadata(
    *,
    total_items: int,
    page: int,
    page_size: int,
) -> dict[str, Any]:
    """
    Build pagination metadata.
    """

    total_pages = calculate_total_pages(
        total_items,
        page_size,
    )

    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
    }



def paginate_response(
    items: Iterable[Any],
    *,
    total_items: int,
    page: int,
    page_size: int,
) -> dict[str, Any]:
    """
    Create paginated API response.
    """

    return {
        "items": list(items),
        "pagination": build_pagination_metadata(
            total_items=total_items,
            page=page,
            page_size=page_size,
        ),
    }



class Pagination:
    """
    Pagination object.

    Used for service/repository layers.
    """

    def __init__(
        self,
        page: int = 1,
        page_size: int = 20,
    ) -> None:

        self.page = max(
            page,
            1,
        )

        self.page_size = max(
            page_size,
            1,
        )


    @property
    def offset(self) -> int:
        """
        Database offset.
        """

        return calculate_offset(
            self.page,
            self.page_size,
        )


    def limit(self) -> int:
        """
        Database limit.
        """

        return self.page_size
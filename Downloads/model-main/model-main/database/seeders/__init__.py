"""
Database seeders.

Exports all database seeding functions.
"""

from .default_models import seed_default_models

__all__ = [
    "seed_default_models",
]
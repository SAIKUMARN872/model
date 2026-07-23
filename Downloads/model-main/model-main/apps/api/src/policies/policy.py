"""
Base policy definitions.

Provides the abstract base class for all application policies.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class Policy(ABC):
    """
    Base class for all application policies.
    """

    name: str = "policy"

    @abstractmethod
    async def evaluate(
        self,
        context: dict[str, Any],
    ) -> bool:
        """
        Evaluate the policy.

        Args:
            context: Execution context.

        Returns:
            True if the policy passes.

        Raises:
            Exception if the policy fails.
        """
        raise NotImplementedError

    async def __call__(
        self,
        context: dict[str, Any],
    ) -> bool:
        """
        Allow policies to be invoked like functions.
        """

        return await self.evaluate(context)


class CompositePolicy(Policy):
    """
    Executes multiple policies in sequence.
    """

    name = "composite"

    def __init__(self, *policies: Policy) -> None:
        self._policies = list(policies)

    async def evaluate(
        self,
        context: dict[str, Any],
    ) -> bool:
        """
        Evaluate all policies.

        Stops immediately if any policy fails.
        """

        for policy in self._policies:
            await policy(context)

        return True

    def add(self, policy: Policy) -> None:
        """
        Add a policy.
        """

        self._policies.append(policy)

    @property
    def policies(self) -> tuple[Policy, ...]:
        """
        Return registered policies.
        """

        return tuple(self._policies)
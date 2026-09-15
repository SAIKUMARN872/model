"""
Security validation for browser automation URLs and actions.
"""

from __future__ import annotations

import ipaddress
import socket
from dataclasses import dataclass
from urllib.parse import (
    urlparse,
)


class SecurityValidationError(
    ValueError
):
    """Raised when a security validation fails."""


@dataclass
class SecurityConfig:
    """Security policy configuration."""

    allowed_domains: set[str] | None = None

    blocked_domains: set[str] | None = None

    allow_http: bool = True

    allow_https: bool = True

    block_private_ips: bool = True

    block_localhost: bool = True

    block_credentials_in_url: bool = True

    max_url_length: int = 4096


class SecurityValidator:
    """
    Validates URLs before browser navigation.

    This is especially important for AI agents because
    an agent should not blindly navigate to arbitrary
    internal/private network addresses.
    """

    def __init__(
        self,
        config: SecurityConfig | None = None,
    ) -> None:

        self.config = (
            config
            or SecurityConfig()
        )

    def validate_url(
        self,
        url: str,
    ) -> str:

        if not isinstance(
            url,
            str,
        ):

            raise SecurityValidationError(
                "URL must be a string."
            )

        url = url.strip()

        if not url:

            raise SecurityValidationError(
                "URL cannot be empty."
            )

        if len(url) > (
            self.config.max_url_length
        ):

            raise SecurityValidationError(
                "URL exceeds maximum allowed length."
            )

        parsed = urlparse(
            url
        )

        scheme = (
            parsed.scheme.lower()
        )

        if (
            scheme == "http"
            and not self.config.allow_http
        ):

            raise SecurityValidationError(
                "HTTP URLs are not allowed."
            )

        if (
            scheme == "https"
            and not self.config.allow_https
        ):

            raise SecurityValidationError(
                "HTTPS URLs are not allowed."
            )

        if scheme not in {
            "http",
            "https",
        }:

            raise SecurityValidationError(
                "Only HTTP and HTTPS URLs are allowed."
            )

        hostname = parsed.hostname

        if not hostname:

            raise SecurityValidationError(
                "URL hostname is missing."
            )

        hostname = hostname.lower().rstrip(
            "."
        )

        if (
            self.config.block_credentials_in_url
            and (
                parsed.username
                or parsed.password
            )
        ):

            raise SecurityValidationError(
                "Credentials in URLs are not allowed."
            )

        self._validate_domain(
            hostname
        )

        self._validate_ip(
            hostname
        )

        return url

    def _validate_domain(
        self,
        hostname: str,
    ) -> None:

        blocked = {
            domain.lower().strip()
            for domain in (
                self.config.blocked_domains
                or set()
            )
        }

        for domain in blocked:

            if (
                hostname == domain
                or hostname.endswith(
                    "." + domain
                )
            ):

                raise SecurityValidationError(
                    f"Domain '{hostname}' is blocked."
                )

        allowed = self.config.allowed_domains

        if allowed:

            normalized = {
                domain.lower().strip()
                for domain in allowed
            }

            if not any(
                hostname == domain
                or hostname.endswith(
                    "." + domain
                )
                for domain in normalized
            ):

                raise SecurityValidationError(
                    f"Domain '{hostname}' is not allowed."
                )

    def _validate_ip(
        self,
        hostname: str,
    ) -> None:

        try:

            address = ipaddress.ip_address(
                hostname
            )

        except ValueError:

            # Normal DNS hostname.
            if (
                self.config.block_localhost
                and hostname
                in {
                    "localhost",
                    "localhost.localdomain",
                }
            ):

                raise SecurityValidationError(
                    "Localhost access is blocked."
                )

            return

        if (
            self.config.block_localhost
            and address.is_loopback
        ):

            raise SecurityValidationError(
                "Loopback addresses are blocked."
            )

        if (
            self.config.block_private_ips
            and (
                address.is_private
                or address.is_link_local
                or address.is_reserved
            )
        ):

            raise SecurityValidationError(
                "Private/internal IP addresses are blocked."
            )

    def validate_navigation(
        self,
        url: str,
    ) -> bool:

        self.validate_url(
            url
        )

        return True
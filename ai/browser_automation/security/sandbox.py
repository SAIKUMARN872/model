from dataclasses import dataclass

from ..schemas import validate_url


@dataclass(frozen=True)
class SandboxPolicy:
    """Application-level browser navigation policy.

    This is not an operating-system sandbox or a network firewall.
    Enforce outbound network restrictions separately in production.
    """

    allow_http: bool = True
    allow_https: bool = True

    def validate_destination(self, url: str) -> str:
        if not isinstance(url, str) or not url.strip():
            raise ValueError("A non-empty destination URL is required.")

        scheme = url.partition(":")[0].strip().lower()

        if scheme == "http" and not self.allow_http:
            raise ValueError("HTTP destinations are disabled by sandbox policy.")

        if scheme == "https" and not self.allow_https:
            raise ValueError("HTTPS destinations are disabled by sandbox policy.")

        return validate_url(url)


def validate_sandbox_destination(
    url: str,
    policy: SandboxPolicy | None = None,
) -> str:
    """Validate a URL against the supplied policy or the default policy."""
    active_policy = policy or SandboxPolicy()
    return active_policy.validate_destination(url)

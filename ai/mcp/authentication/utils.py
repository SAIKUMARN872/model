"""Authentication utility functions."""
import base64
import hashlib
import secrets


def generate_state() -> str:
    """Create an unpredictable OAuth state value."""
    return secrets.token_urlsafe(32)


def verify_state(expected: str, received: str) -> bool:
    """Constant-time comparison for OAuth state values."""
    if not isinstance(expected, str) or not isinstance(received, str):
        return False
    return secrets.compare_digest(expected, received)


def pkce_code_verifier() -> str:
    """Generate a PKCE-compatible verifier."""
    return secrets.token_urlsafe(48)


def pkce_code_challenge(verifier: str) -> str:
    """Return an S256 PKCE challenge for a verifier."""
    if not isinstance(verifier, str) or not 43 <= len(verifier) <= 128:
        raise ValueError("PKCE verifier length must be 43 to 128 characters")
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")

"""Write already-received download bytes safely to disk."""

import os
import tempfile
from pathlib import Path

from .validator import DownloadValidator


class DownloadHandler:
    def __init__(self, validator: DownloadValidator | None = None) -> None:
        self.validator = validator or DownloadValidator()

    def save_bytes(self, content: bytes, destination: str | Path) -> Path:
        if not isinstance(content, bytes):
            raise TypeError("Download content must be bytes.")

        self.validator.validate_size(len(content))
        target = self.validator.validate_destination(destination)
        target.parent.mkdir(parents=True, exist_ok=True)

        if target.exists() and not self.validator.allow_overwrite:
            raise FileExistsError("Destination already exists.")

        temporary_path: str | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                dir=target.parent,
                prefix=".modelnow-download-",
                suffix=".tmp",
                delete=False,
            ) as temporary:
                temporary_path = temporary.name
                temporary.write(content)
                temporary.flush()
                os.fsync(temporary.fileno())

            # Recheck before replacement in case another process created the file.
            if target.exists() and not self.validator.allow_overwrite:
                raise FileExistsError("Destination already exists.")

            if self.validator.allow_overwrite:
                os.replace(temporary_path, target)
            else:
                # Exclusive creation avoids replacing a file created concurrently.
                with open(temporary_path, "rb") as source:
                    descriptor = os.open(
                        target,
                        os.O_WRONLY | os.O_CREAT | os.O_EXCL,
                        0o600,
                    )
                    with os.fdopen(descriptor, "wb") as output:
                        while chunk := source.read(64 * 1024):
                            output.write(chunk)
                os.unlink(temporary_path)

            temporary_path = None
            return target
        finally:
            if temporary_path and os.path.exists(temporary_path):
                os.unlink(temporary_path)

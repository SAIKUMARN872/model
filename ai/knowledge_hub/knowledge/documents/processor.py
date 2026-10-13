from pathlib import Path

from ..exceptions import DocumentProcessingError, DocumentValidationError
from ..constants import SUPPORTED_EXTENSIONS


class DocumentProcessor:
    def process(self, file_path: str) -> tuple[str, dict]:
        path = Path(file_path).expanduser().resolve()

        if not path.is_file():
            raise DocumentValidationError(f"File not found: {path}")

        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise DocumentValidationError(
                f"Unsupported file type: {path.suffix}"
            )

        try:
            extension = path.suffix.lower()

            if extension in {".txt", ".md"}:
                text = path.read_text(encoding="utf-8-sig")

            elif extension == ".pdf":
                try:
                    from pypdf import PdfReader
                except ImportError as exc:
                    raise DocumentProcessingError(
                        "PDF support requires pypdf. Install it with: "
                        "python -m pip install pypdf"
                    ) from exc

                reader = PdfReader(str(path))
                text = "\n".join(
                    page.extract_text() or "" for page in reader.pages
                )
                if not text.strip():
                    raise DocumentProcessingError(
                        "No selectable text found in PDF. "
                        "Scanned PDFs require OCR."
                    )

            elif extension == ".docx":
                try:
                    from docx import Document
                except ImportError as exc:
                    raise DocumentProcessingError(
                        "DOCX support requires python-docx. Install it with: "
                        "python -m pip install python-docx"
                    ) from exc

                document = Document(str(path))
                text = "\n".join(
                    paragraph.text for paragraph in document.paragraphs
                )

            else:
                raise DocumentValidationError("Unsupported file type.")

            if not text.strip():
                raise DocumentProcessingError("The document contains no text.")

            metadata = {
                "filename": path.name,
                "extension": extension,
                "file_size_bytes": path.stat().st_size,
            }
            return text, metadata

        except (DocumentProcessingError, DocumentValidationError):
            raise
        except Exception as exc:
            raise DocumentProcessingError(
                f"Could not process {path.name}: {exc}"
            ) from exc

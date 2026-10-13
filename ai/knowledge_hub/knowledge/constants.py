from pathlib import Path
import os

KNOWLEDGE_DATA_DIR = Path(
    os.environ.get("MODELNOW_KNOWLEDGE_DIR", "data/knowledge_hub")
).resolve()

DEFAULT_COLLECTION = "default"
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
DEFAULT_CHUNK_SIZE = 1200
DEFAULT_CHUNK_OVERLAP = 200
DEFAULT_TOP_K = 5
SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

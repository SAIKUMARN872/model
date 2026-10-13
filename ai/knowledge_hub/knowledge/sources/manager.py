from .registry import SourceRegistry


class SourceManager:
    def __init__(self, registry=None):
        self.registry = registry or SourceRegistry()

    def register_file(self, file_path: str, collection_id="default"):
        from pathlib import Path
        path = Path(file_path).resolve()
        if not path.is_file():
            raise FileNotFoundError(str(path))
        return self.registry.register({
            "source_id": str(path),
            "source_type": "file",
            "location": str(path),
            "collection_id": collection_id,
            "enabled": True,
            "metadata": {"filename": path.name},
        })

    def list(self, collection_id=None):
        return self.registry.list(collection_id)

    def remove(self, source_id):
        return self.registry.remove(source_id)

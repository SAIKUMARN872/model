"""MongoDB client using PyMongo with read-only operations."""

from collections.abc import Mapping
from typing import Any

from ai.connectors.exceptions import ConnectorConfigurationError, ConnectorRequestError


class MongoDBClient:
    def __init__(self, uri, database, *, timeout_seconds=10.0):
        from ai.connectors.mongodb.config import validate_mongodb_uri

        self._uri = validate_mongodb_uri(uri)
        self._database_name = database
        self._timeout_ms = int(timeout_seconds * 1000)
        self._client = None

    def _database(self):
        if self._client is None:
            try:
                from pymongo import MongoClient
                from pymongo.server_api import ServerApi

                self._client = MongoClient(
                    self._uri,
                    serverSelectionTimeoutMS=self._timeout_ms,
                    connectTimeoutMS=self._timeout_ms,
                    socketTimeoutMS=self._timeout_ms,
                    server_api=ServerApi("1"),
                )
            except ImportError as exc:
                raise ConnectorConfigurationError(
                    "Install pymongo to use the MongoDB connector"
                ) from exc
            except Exception as exc:
                raise ConnectorRequestError("Could not initialize MongoDB client") from exc
        return self._client[self._database_name]

    def list_collections(self):
        return sorted(self._database().list_collection_names())

    def list_databases(self):
        if self._client is None:
            self._database()
        return sorted(self._client.list_database_names())

    def find_documents(self, collection, filter_document, limit, projection=None):
        database = self._database()
        if collection not in database.list_collection_names():
            raise ConnectorRequestError("Collection was not found")
        cursor = database[collection].find(
            filter_document,
            projection=projection,
            limit=limit,
        )
        try:
            return [self._serialize(doc) for doc in cursor]
        finally:
            cursor.close()

    @classmethod
    def _serialize(cls, value):
        if isinstance(value, Mapping):
            return {str(k): cls._serialize(v) for k, v in value.items()}
        if isinstance(value, (list, tuple)):
            return [cls._serialize(v) for v in value]
        if value.__class__.__name__ == "ObjectId":
            return str(value)
        if value.__class__.__name__ == "datetime":
            return value.isoformat()
        if value.__class__.__name__ == "Decimal128":
            return str(value)
        if value.__class__.__name__ == "Binary":
            return {"binary_base64": value.as_base64()}
        if value.__class__.__name__ == "DBRef":
            return {"$ref": value.collection, "$id": cls._serialize(value.id)}
        if value is None or isinstance(value, (str, int, float, bool)):
            return value
        return str(value)

    def close(self):
        if self._client is not None:
            self._client.close()
            self._client = None

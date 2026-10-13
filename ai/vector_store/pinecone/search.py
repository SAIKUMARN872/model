from .utils import (
    validate_index_name,
    validate_vector,
    validate_top_k,
    validate_metadata,
)


class PineconeSearch:
    def __init__(self, client, index_name: str | None = None):
        self.client = client
        self.index_name = validate_index_name(
            index_name or client.index_name or ""
        )

    def search(
        self,
        query_vector,
        *,
        top_k: int = 5,
        filters: dict | None = None,
        namespace: str = "",
        include_values: bool = False,
    ) -> list[dict]:
        vector = validate_vector(query_vector)
        top_k = validate_top_k(top_k)
        filters = validate_metadata(filters)

        kwargs = {
            "vector": vector,
            "top_k": top_k,
            "namespace": namespace,
            "include_metadata": True,
            "include_values": include_values,
        }
        if filters:
            kwargs["filter"] = filters

        response = self.client.get_index(self.index_name).query(**kwargs)
        matches = getattr(response, "matches", None)
        if matches is None and isinstance(response, dict):
            matches = response.get("matches", [])

        results = []
        for match in matches or []:
            if isinstance(match, dict):
                get_value = match.get
            else:
                get_value = lambda key, default=None: getattr(match, key, default)

            results.append({
                "id": get_value("id"),
                "score": get_value("score"),
                "metadata": get_value("metadata") or {},
                "values": get_value("values") if include_values else None,
            })
        return results

import json

from .utils import (
    validate_collection_name,
    validate_embedding,
    validate_top_k,
    validate_metadata,
    quote_identifier,
)


class PgVectorSearch:
    def __init__(self, client):
        self.client = client

    def search(
        self,
        collection_name: str,
        query_embedding,
        *,
        dimension: int,
        top_k: int = 5,
        filters: dict | None = None,
    ) -> list[dict]:
        name = validate_collection_name(collection_name)
        vector = validate_embedding(query_embedding, dimension)
        top_k = validate_top_k(top_k)
        filters = validate_metadata(filters)

        table = (
            f"{quote_identifier(self.client.schema)}."
            f"{quote_identifier(name)}"
        )
        vector_value = "[" + ",".join(map(str, vector)) + "]"
        connection = self.client.ensure_connected()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT a.atttypmod
                    FROM pg_attribute a
                    JOIN pg_class c ON c.oid = a.attrelid
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = %s
                      AND c.relname = %s
                      AND a.attname = 'embedding'
                      AND NOT a.attisdropped
                    """,
                    (self.client.schema, name),
                )
                row = cursor.fetchone()
                if row is None:
                    raise ValueError(f"Collection or embedding column not found: {name}")

                # pgvector stores VECTOR(dimension) as typmod = dimension + 4.
                actual_dimension = int(row[0]) - 4
                if actual_dimension != len(vector):
                    raise ValueError(
                        f"Expected {actual_dimension}-dimensional query embedding; "
                        f"received {len(vector)} dimensions."
                    )

                clauses = []
                params = [vector_value]
                if filters:
                    clauses.append("metadata @> %s::jsonb")
                    params.append(json.dumps(filters))

                where_sql = (" WHERE " + " AND ".join(clauses)) if clauses else ""
                params.extend([vector_value, top_k])

                cursor.execute(
                    f"""
                    SELECT document_id, text, metadata,
                           embedding <=> %s::vector AS distance
                    FROM {table}
                    {where_sql}
                    ORDER BY embedding <=> %s::vector
                    LIMIT %s
                    """,
                    tuple(params),
                )
                rows = cursor.fetchall()

            return [
                {
                    "document_id": row[0],
                    "text": row[1],
                    "metadata": row[2] or {},
                    "distance": float(row[3]),
                    "score": 1.0 - float(row[3]),
                }
                for row in rows
            ]
        except Exception:
            connection.rollback()
            raise

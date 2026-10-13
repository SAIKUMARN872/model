import os
import time
import uuid
import sys

def main():
    url = os.getenv("WEAVIATE_URL")
    key = os.getenv("WEAVIATE_API_KEY")

    if not url or not key:
        print("FAIL: Weaviate credentials are missing.")
        return 1

    import weaviate
    from weaviate.classes.init import Auth
    from weaviate.classes.config import Configure, Property, DataType

    client = None
    name = "ModelNowDiag" + uuid.uuid4().hex[:10]

    try:
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=url,
            auth_credentials=Auth.api_key(key),
        )

        collection = client.collections.create(
            name=name,
            vector_config=Configure.Vectors.self_provided(),
            properties=[
                Property(name="title", data_type=DataType.TEXT),
                Property(name="body", data_type=DataType.TEXT),
            ],
        )

        collection.data.insert(
            uuid=str(uuid.uuid4()),
            properties={"title": "ModelNow AI", "body": "Vector search test"},
            vector=[1.0, 0.0, 0.0],
        )
        collection.data.insert(
            uuid=str(uuid.uuid4()),
            properties={"title": "ModelNow storage", "body": "Database test"},
            vector=[0.0, 1.0, 0.0],
        )

        print("Inserted two objects.")

        for attempt in range(1, 6):
            count = collection.aggregate.over_all(total_count=True).total_count
            print(f"Attempt {attempt}: object count = {count}")

            result = collection.query.fetch_objects(limit=10)
            print("Fetch objects:", [
                obj.properties.get("title") for obj in result.objects
            ])

            search = collection.query.near_vector(
                near_vector=[1.0, 0.0, 0.0],
                limit=2,
            )
            print("Vector search:", [
                obj.properties.get("title") for obj in search.objects
            ])

            if search.objects:
                print("PASS: Live vector search returned results.")
                return 0

            time.sleep(2)

        print("FAIL: Objects were inserted, but vector search returned no results.")
        return 1

    except Exception as exc:
        print(f"DIAGNOSTIC ERROR: {type(exc).__name__}: {exc}")
        return 1

    finally:
        if client is not None:
            try:
                if client.collections.exists(name):
                    client.collections.delete(name)
                    print("Temporary diagnostic collection deleted.")
            except Exception as exc:
                print(f"CLEANUP WARNING: {exc}")
            client.close()

if __name__ == "__main__":
    sys.exit(main())

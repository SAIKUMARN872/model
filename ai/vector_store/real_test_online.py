import os
import uuid
import sys

def main():
    url = os.getenv("WEAVIATE_URL")
    api_key = os.getenv("WEAVIATE_API_KEY")

    if not url or not api_key:
        print("FAIL: Set WEAVIATE_URL and WEAVIATE_API_KEY.")
        return 1

    try:
        import weaviate
        from weaviate.classes.init import Auth
        from weaviate.classes.config import Configure, Property, DataType
        from weaviate.classes.query import MetadataQuery
    except ImportError as exc:
        print(f"FAIL: Install current Weaviate client: {exc}")
        return 1

    client = None
    collection_name = "ModelNowOnlineTest" + uuid.uuid4().hex[:10]
    success = False

    try:
        print("Connecting to real Weaviate Cloud...")
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=url,
            auth_credentials=Auth.api_key(api_key),
        )

        if not client.is_ready():
            raise RuntimeError("Weaviate cluster is not ready.")

        print("PASS: Real connection and readiness")

        collection = client.collections.create(
            name=collection_name,
            vector_config=Configure.Vectors.self_provided(),
            properties=[
                Property(name="title", data_type=DataType.TEXT),
                Property(name="body", data_type=DataType.TEXT),
            ],
        )
        print("PASS: Temporary collection created")

        id1 = str(uuid.uuid4())
        id2 = str(uuid.uuid4())

        collection.data.insert(
            uuid=id1,
            properties={
                "title": "ModelNow AI",
                "body": "Vector search and retrieval testing",
            },
            vector=[1.0, 0.0, 0.0],
        )
        collection.data.insert(
            uuid=id2,
            properties={
                "title": "ModelNow storage",
                "body": "Persistent vector database integration",
            },
            vector=[0.0, 1.0, 0.0],
        )
        print("PASS: Real vector insertion")

        objects = []
        for attempt in range(1, 6):
            result = collection.query.near_vector(
                near_vector=[1.0, 0.0, 0.0],
                limit=2,
            )
            objects = result.objects
            print(f"Search attempt {attempt}: {len(objects)} result(s)")
            if len(objects) >= 2:
                break
            import time
            time.sleep(2)
        if len(objects) < 2:
            raise RuntimeError(
                f"Expected 2 search results, received {len(objects)}"
            )

        if objects[0].properties.get("title") != "ModelNow AI":
            raise RuntimeError("Nearest-vector ranking did not match expectation.")

        print("PASS: Real vector similarity search and ranking")

        fetched = collection.query.fetch_object_by_id(id1)
        if fetched is None or fetched.properties.get("title") != "ModelNow AI":
            raise RuntimeError("Inserted object could not be retrieved.")

        print("PASS: Real object retrieval")

        collection.data.delete_by_id(id1)
        deleted = collection.query.fetch_object_by_id(id1)
        if deleted is not None:
            raise RuntimeError("Deleted object is still retrievable.")

        print("PASS: Real object deletion")
        success = True

    except Exception as exc:
        print(f"FAIL: {type(exc).__name__}: {exc}")

    finally:
        if client is not None:
            try:
                if client.collections.exists(collection_name):
                    client.collections.delete(collection_name)
                    print("PASS: Temporary collection cleanup")
            except Exception as cleanup_exc:
                success = False
                print(f"CLEANUP FAIL: {cleanup_exc}")
            finally:
                client.close()

    if success:
        print("MODELNOW WEAVIATE REAL ONLINE TEST: PASS")
        return 0

    print("MODELNOW WEAVIATE REAL ONLINE TEST: FAIL")
    return 1

if __name__ == "__main__":
    sys.exit(main())



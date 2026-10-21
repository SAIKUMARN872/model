"""GraphQL connector helpers."""
from ai.connectors.graphql.client import GraphQLClient
from ai.connectors.graphql.config import GraphQLConfig, GraphQLOperationConfig

def create_graphql_client(config: GraphQLConfig) -> GraphQLClient:
    return GraphQLClient(config.endpoint_url, config.allowed_hosts, config.timeout_seconds)

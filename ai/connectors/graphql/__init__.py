"""GraphQL connector public API."""
from ai.connectors.graphql.client import GraphQLClient
from ai.connectors.graphql.config import GraphQLConfig, GraphQLOperationConfig
from ai.connectors.graphql.connector import GraphQLConnector
from ai.connectors.graphql.tools import create_graphql_client

def register_graphql_connector(registry, config: GraphQLConfig, client=None):
    connector = GraphQLConnector(config, client=client)
    registry.register(connector)
    return connector

__all__ = [
    "GraphQLClient", "GraphQLConfig", "GraphQLOperationConfig",
    "GraphQLConnector", "create_graphql_client", "register_graphql_connector",
]

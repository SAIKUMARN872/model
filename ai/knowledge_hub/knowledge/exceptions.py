class KnowledgeHubError(Exception):
    """Base exception for Knowledge Hub."""


class DocumentValidationError(KnowledgeHubError):
    pass


class DocumentProcessingError(KnowledgeHubError):
    pass


class CollectionNotFoundError(KnowledgeHubError):
    pass


class RetrievalError(KnowledgeHubError):
    pass


class KnowledgePermissionError(KnowledgeHubError):
    pass

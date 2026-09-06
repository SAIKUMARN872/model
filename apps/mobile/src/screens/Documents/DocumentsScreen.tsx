export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size?: number;
  url?: string;
  createdAt: string;
}

export class DocumentsScreen {
  private documents: DocumentItem[] = [];

  public addDocument(
    name: string,
    type: string,
    size?: number,
    url?: string
  ): DocumentItem {
    if (!name.trim()) {
      throw new Error(
        "Document name is required."
      );
    }

    const document: DocumentItem = {
      id: this.generateId(),
      name,
      type,
      size,
      url,
      createdAt:
        new Date().toISOString(),
    };

    this.documents.push(document);

    return document;
  }

  public getDocuments(): DocumentItem[] {
    return [...this.documents];
  }

  public getDocument(
    id: string
  ): DocumentItem | undefined {
    return this.documents.find(
      (document) =>
        document.id === id
    );
  }

  public removeDocument(
    id: string
  ): boolean {
    const index =
      this.documents.findIndex(
        (document) =>
          document.id === id
      );

    if (index === -1) {
      return false;
    }

    this.documents.splice(index, 1);

    return true;
  }

  public clearDocuments(): void {
    this.documents = [];
  }

  public count(): number {
    return this.documents.length;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const documentsScreen =
  new DocumentsScreen();

export default documentsScreen;
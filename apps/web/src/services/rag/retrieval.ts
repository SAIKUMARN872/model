export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
}

export async function retrieveDocuments(
  query: string
): Promise<RetrievedDocument[]> {
  return [
    {
      id: "1",
      title: "AI Research",
      content: `Relevant information about ${query}`,
    },
    {
      id: "2",
      title: "Knowledge Base",
      content: `Additional context for ${query}`,
    },
  ];
}
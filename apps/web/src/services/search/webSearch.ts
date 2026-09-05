export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function webSearch(
  query: string
): Promise<SearchResult[]> {
  return [
    {
      title: `${query} - Documentation`,
      url: "https://example.com/docs",
      snippet: "Official documentation and guides.",
    },
    {
      title: `${query} - Tutorial`,
      url: "https://example.com/tutorial",
      snippet: "Step-by-step tutorial.",
    },
  ];
}
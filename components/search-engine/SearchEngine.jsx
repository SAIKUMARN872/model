import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const SearchEngine = ({
  apiBaseUrl = "/api",
  workspaceId,
  organizationId,
}) => {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [recentSearches, setRecentSearches] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [selectedResult, setSelectedResult] =
    useState(null);

  const [filters, setFilters] = useState({
    type: "all",
    sortBy: "relevance",
    timeRange: "all",
  });

  const [searchConfig, setSearchConfig] =
    useState({
      semanticSearch: true,
      includeArchived: false,
      maxResults: 20,
    });

  const loadRecentSearches =
    useCallback(async () => {
      try {
        const params =
          new URLSearchParams();

        if (workspaceId) {
          params.set(
            "workspaceId",
            workspaceId
          );
        }

        if (organizationId) {
          params.set(
            "organizationId",
            organizationId
          );
        }

        const response =
          await fetch(
            `${apiBaseUrl}/search/recent?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setRecentSearches(
          Array.isArray(
            data.searches
          )
            ? data.searches
            : []
        );
      } catch {
        // Recent searches are optional.
      } finally {
        setInitialLoading(false);
      }
    }, [
      apiBaseUrl,
      workspaceId,
      organizationId,
    ]);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  const executeSearch = async (
    event
  ) => {
    if (event) {
      event.preventDefault();
    }

    const normalizedQuery =
      query.trim();

    if (!normalizedQuery) {
      setError(
        "Please enter a search query."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(
        normalizedQuery
      );

      const response =
        await fetch(
          `${apiBaseUrl}/search`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              query: normalizedQuery,
              workspaceId,
              organizationId,
              filters,
              config: searchConfig,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Search failed (${response.status}).`
        );
      }

      const data =
        await response.json();

      setResults(
        Array.isArray(data.results)
          ? data.results
          : []
      );

      if (
        data.searchId ||
        normalizedQuery
      ) {
        setRecentSearches(
          (current) => [
            {
              id:
                data.searchId ||
                Date.now(),
              query:
                normalizedQuery,
              createdAt:
                new Date().toISOString(),
            },
            ...current.filter(
              (item) =>
                item.query !==
                normalizedQuery
            ),
          ].slice(0, 10)
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete search."
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    let current = [...results];

    if (filters.type !== "all") {
      current = current.filter(
        (result) =>
          result.type ===
          filters.type
      );
    }

    if (filters.sortBy === "recent") {
      current.sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.createdAt ||
              0
          ) -
          new Date(
            a.updatedAt ||
              a.createdAt ||
              0
          )
      );
    }

    if (filters.sortBy === "relevance") {
      current.sort(
        (a, b) =>
          Number(
            b.score || 0
          ) -
          Number(
            a.score || 0
          )
      );
    }

    return current;
  }, [results, filters]);

  const resultTypes = useMemo(() => {
    return [
      ...new Set(
        results
          .map(
            (result) =>
              result.type
          )
          .filter(Boolean)
      ),
    ];
  }, [results]);

  const formatDate = (value) => {
    if (!value) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(value));
  };

  const formatScore = (value) => {
    const score =
      Number(value) || 0;

    return `${Math.min(
      100,
      Math.max(
        0,
        score * 100
      )
    ).toFixed(0)}%`;
  };

  const clearResults = () => {
    setResults([]);
    setSearchQuery("");
    setQuery("");
    setError(null);
  };

  if (initialLoading) {
    return (
      <section className="search-engine">
        <div className="search-engine__loading">
          Loading search engine...
        </div>
      </section>
    );
  }

  return (
    <section className="search-engine">
      <header className="search-engine__header">
        <div>
          <span className="search-engine__eyebrow">
            AI Intelligence
          </span>

          <h1>
            Enterprise Search Engine
          </h1>

          <p>
            Search across your organization's
            knowledge, documents, AI data,
            and workspace resources.
          </p>
        </div>
      </header>

      {error && (
        <div
          className="search-engine__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        className="search-engine__search-form"
        onSubmit={executeSearch}
      >
        <div className="search-engine__search-box">
          <span
            aria-hidden="true"
          >
            🔍
          </span>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search your workspace..."
            aria-label="Search your workspace"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={() =>
                setQuery("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !query.trim()
            }
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>
        </div>
      </form>

      <div className="search-engine__layout">
        <aside className="search-engine__sidebar">
          <div>
            <h3>
              Search Settings
            </h3>

            <label>
              Result Type

              <select
                value={filters.type}
                onChange={(event) =>
                  setFilters(
                    (current) => ({
                      ...current,
                      type:
                        event.target
                          .value,
                    })
                  )
                }
              >
                <option value="all">
                  All Types
                </option>

                {resultTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Sort By

              <select
                value={
                  filters.sortBy
                }
                onChange={(event) =>
                  setFilters(
                    (current) => ({
                      ...current,
                      sortBy:
                        event.target
                          .value,
                    })
                  )
                }
              >
                <option value="relevance">
                  Relevance
                </option>

                <option value="recent">
                  Recently Updated
                </option>
              </select>
            </label>

            <label>
              Time Range

              <select
                value={
                  filters.timeRange
                }
                onChange={(event) =>
                  setFilters(
                    (current) => ({
                      ...current,
                      timeRange:
                        event.target
                          .value,
                    })
                  )
                }
              >
                <option value="all">
                  All Time
                </option>

                <option value="day">
                  Last 24 Hours
                </option>

                <option value="week">
                  Last 7 Days
                </option>

                <option value="month">
                  Last 30 Days
                </option>

                <option value="year">
                  Last Year
                </option>
              </select>
            </label>
          </div>

          <div className="search-engine__advanced">
            <h3>
              Advanced Search
            </h3>

            <label className="search-engine__checkbox">
              <input
                type="checkbox"
                checked={
                  searchConfig.semanticSearch
                }
                onChange={(event) =>
                  setSearchConfig(
                    (current) => ({
                      ...current,
                      semanticSearch:
                        event.target
                          .checked,
                    })
                  )
                }
              />

              <span>
                Semantic Search
              </span>
            </label>

            <label className="search-engine__checkbox">
              <input
                type="checkbox"
                checked={
                  searchConfig.includeArchived
                }
                onChange={(event) =>
                  setSearchConfig(
                    (current) => ({
                      ...current,
                      includeArchived:
                        event.target
                          .checked,
                    })
                  )
                }
              />

              <span>
                Include Archived
              </span>
            </label>

            <label>
              Maximum Results

              <input
                type="number"
                min="1"
                max="100"
                value={
                  searchConfig.maxResults
                }
                onChange={(event) =>
                  setSearchConfig(
                    (current) => ({
                      ...current,
                      maxResults:
                        Number(
                          event.target
                            .value
                        ),
                    })
                  )
                }
              />
            </label>
          </div>

          {recentSearches.length >
            0 && (
            <div className="search-engine__recent">
              <h3>
                Recent Searches
              </h3>

              {recentSearches.map(
                (item) => (
                  <button
                    key={
                      item.id ||
                      item.query
                    }
                    type="button"
                    onClick={() => {
                      setQuery(
                        item.query
                      );

                      setTimeout(
                        () =>
                          executeSearch(),
                        0
                      );
                    }}
                  >
                    <span>
                      🔍
                    </span>

                    {item.query}
                  </button>
                )
              )}
            </div>
          )}
        </aside>

        <main className="search-engine__results">
          <div className="search-engine__results-header">
            <div>
              <h2>
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : "Search Results"}
              </h2>

              <span>
                {filteredResults.length}{" "}
                result
                {filteredResults.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

            {filteredResults.length >
              0 && (
              <button
                type="button"
                onClick={clearResults}
              >
                Clear Results
              </button>
            )}
          </div>

          {loading ? (
            <div className="search-engine__results-loading">
              <div>
                Searching your
                organization...
              </div>
            </div>
          ) : filteredResults.length ===
            0 ? (
            <div className="search-engine__empty">
              <div className="search-engine__empty-icon">
                🔎
              </div>

              <h3>
                No results found
              </h3>

              <p>
                Try different keywords
                or adjust your search
                filters.
              </p>
            </div>
          ) : (
            <div className="search-engine__result-list">
              {filteredResults.map(
                (result, index) => (
                  <article
                    key={
                      result.id ||
                      `${result.title}-${index}`
                    }
                    className="search-engine__result"
                  >
                    <div className="search-engine__result-header">
                      <div>
                        <span className="search-engine__result-type">
                          {result.type ||
                            "Document"}
                        </span>

                        <h3>
                          {result.title ||
                            "Untitled Result"}
                        </h3>
                      </div>

                      {result.score !==
                        undefined && (
                        <span className="search-engine__score">
                          {formatScore(
                            result.score
                          )}{" "}
                          match
                        </span>
                      )}
                    </div>

                    <p>
                      {result.highlight ||
                        result.description ||
                        result.content ||
                        "No preview available."}
                    </p>

                    <div className="search-engine__result-meta">
                      {result.source && (
                        <span>
                          Source:{" "}
                          {
                            result.source
                          }
                        </span>
                      )}

                      {result.updatedAt && (
                        <span>
                          Updated:{" "}
                          {formatDate(
                            result.updatedAt
                          )}
                        </span>
                      )}

                      {result.owner && (
                        <span>
                          Owner:{" "}
                          {
                            result.owner
                          }
                        </span>
                      )}
                    </div>

                    {result.tags?.length >
                      0 && (
                      <div className="search-engine__tags">
                        {result.tags
                          .slice(0, 5)
                          .map(
                            (tag) => (
                              <span
                                key={tag}
                              >
                                {tag}
                              </span>
                            )
                          )}
                      </div>
                    )}

                    <footer>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedResult(
                            result
                          )
                        }
                      >
                        View Details
                      </button>

                      {result.url && (
                        <a
                          href={
                            result.url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Source
                        </a>
                      )}
                    </footer>
                  </article>
                )
              )}
            </div>
          )}
        </main>
      </div>

      {selectedResult && (
        <div
          className="search-engine__modal-backdrop"
          onClick={() =>
            setSelectedResult(
              null
            )
          }
        >
          <div
            className="search-engine__modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  {
                    selectedResult.type ||
                    "Search Result"
                  }
                </span>

                <h2>
                  {
                    selectedResult.title ||
                    "Untitled Result"
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedResult(
                    null
                  )
                }
              >
                ×
              </button>
            </header>

            <div className="search-engine__modal-body">
              <div className="search-engine__detail-grid">
                <div>
                  <span>
                    Relevance
                  </span>

                  <strong>
                    {formatScore(
                      selectedResult.score
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Source
                  </span>

                  <strong>
                    {
                      selectedResult.source ||
                      "Unknown"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Updated
                  </span>

                  <strong>
                    {formatDate(
                      selectedResult.updatedAt
                    )}
                  </strong>
                </div>
              </div>

              <div>
                <h3>
                  Content
                </h3>

                <p>
                  {
                    selectedResult.content ||
                    selectedResult.description ||
                    "No content available."
                  }
                </p>
              </div>

              {selectedResult.metadata && (
                <div>
                  <h3>
                    Metadata
                  </h3>

                  <pre>
                    {JSON.stringify(
                      selectedResult.metadata,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>

            <footer>
              <button
                type="button"
                onClick={() =>
                  setSelectedResult(
                    null
                  )
                }
              >
                Close
              </button>

              {selectedResult.url && (
                <a
                  href={
                    selectedResult.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Source
                </a>
              )}
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchEngine;
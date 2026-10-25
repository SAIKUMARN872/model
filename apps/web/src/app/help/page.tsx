
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  Globe,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type HelpArticle = {
  title: string;
  description: string;
  content: string[];
};

type HelpCollection = {
  title: string;
  description: string;
  icon: typeof CircleHelp;
  articles: HelpArticle[];
};

type ArticleWithCollection = HelpArticle & {
  collectionTitle: string;
  collection: HelpCollection;
};

const collections: HelpCollection[] = [
  {
    title: "Getting started",
    description: "Learn the basics of using ModelNow.",
    icon: Sparkles,
    articles: [
      {
        title: "What is ModelNow?",
        description: "An introduction to the ModelNow workspace.",
        content: [
          "Welcome to ModelNow.",
          "ModelNow is an AI workspace designed to bring conversations, knowledge, and AI-powered tools together in one place.",
          "This guide introduces the main areas of the workspace. Feature-specific instructions will be added as each workflow is finalized.",
        ],
      },
      {
        title: "Create your first chat",
        description: "Learn how to start a conversation with AI.",
        content: [
          "Open the ModelNow chat workspace.",
          "Enter your question or task in the message box and send it.",
          "Continue the conversation with follow-up questions and provide additional context when needed.",
        ],
      },
      {
        title: "Explore ModelNow features",
        description: "Get familiar with the workspace and its tools.",
        content: [
          "ModelNow is being developed with multiple AI capabilities and workspace tools.",
          "Available features depend on which capabilities have been enabled.",
        ],
      },
    ],
  },
  {
    title: "Using ModelNow",
    description: "Guides for chats, files, and workspace tools.",
    icon: CircleHelp,
    articles: [
      {
        title: "Using the chat workspace",
        description: "Understand the main chat interface.",
        content: [
          "Use the chat workspace to enter prompts, ask questions, and work with AI.",
          "The capabilities available may depend on which ModelNow features have been enabled.",
        ],
      },
      {
        title: "Working with files",
        description: "Learn about adding files to your workflow.",
        content: [
          "File support and document workflows are being developed for ModelNow.",
          "Instructions for supported file types and processing will be added as those workflows are finalized.",
        ],
      },
      {
        title: "Search and research tools",
        description: "Understand available search capabilities.",
        content: [
          "ModelNow may provide search and research tools depending on the enabled capabilities.",
          "Feature-specific guidance will be added as these tools are finalized.",
        ],
      },
    ],
  },
  {
    title: "Privacy and security",
    description: "Learn about privacy, data, and account protection.",
    icon: ShieldCheck,
    articles: [
      {
        title: "Privacy center",
        description: "Find privacy information for ModelNow.",
        content: [
          "This section will provide information about privacy-related features and data controls.",
          "Add verified details about data handling and retention before publishing final documentation.",
        ],
      },
      {
        title: "Keeping your account secure",
        description: "Learn about account security.",
        content: [
          "Use secure authentication practices and do not share your passwords or private credentials.",
          "ModelNow-specific security settings will be documented here when available.",
        ],
      },
    ],
  },
  {
    title: "Account and billing",
    description: "Help with account settings and plans.",
    icon: FileText,
    articles: [
      {
        title: "Manage your account",
        description: "Find account-related guidance.",
        content: [
          "Account management instructions will be added as the ModelNow account workflow is finalized.",
        ],
      },
      {
        title: "Plans and subscriptions",
        description: "Learn about plans and subscription management.",
        content: [
          "Confirm plan availability, pricing, and subscription details before publishing final billing documentation.",
        ],
      },
    ],
  },
];

const allArticles: ArticleWithCollection[] = collections.flatMap(
  (collection) =>
    collection.articles.map((article) => ({
      ...article,
      collectionTitle: collection.title,
      collection,
    })),
);

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [selectedCollection, setSelectedCollection] =
    useState<HelpCollection | null>(null);
  const [selectedArticle, setSelectedArticle] =
    useState<HelpArticle | null>(null);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return [];

    return allArticles.filter((article) =>
      [
        article.title,
        article.description,
        article.collectionTitle,
        ...article.content,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openArticle(article: HelpArticle) {
    setSelectedArticle(article);
    scrollToTop();
  }

  function openSearchResult(article: ArticleWithCollection) {
    setSelectedCollection(article.collection);
    setSelectedArticle(article);
    scrollToTop();
  }

  function openCollection(collection: HelpCollection) {
    setSelectedCollection(collection);
    setSelectedArticle(null);
    setQuery("");
    scrollToTop();
  }

  function returnToHome() {
    setSelectedCollection(null);
    setSelectedArticle(null);
    setQuery("");
    scrollToTop();
  }

  function goBack() {
    if (selectedArticle) {
      setSelectedArticle(null);
      scrollToTop();
      return;
    }

    if (selectedCollection) {
      setSelectedCollection(null);
      scrollToTop();
      return;
    }

    window.location.href = "/";
  }

  function clearSearch() {
    setQuery("");
    setSelectedCollection(null);
    setSelectedArticle(null);
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-white text-[#202123]">
      <header className="sticky top-0 z-30 w-full border-b border-[#e5e5e5] bg-white">
        <div className="flex min-h-[65px] w-full items-center justify-between gap-3 px-4 sm:px-8">
          <Link
            href="/"
            aria-label="ModelNow home"
            className="flex min-w-0 shrink items-center gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5e7eb] bg-[#f3f4f6] text-[#202123]">
              <Sparkles size={19} />
            </span>

            <span className="truncate text-lg font-semibold tracking-[-0.5px]">
              ModelNow
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Language: English"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#555] hover:bg-[#f5f5f5] sm:flex"
            >
              <Globe size={16} />
              <span>English</span>
              <ChevronRight size={14} className="rotate-90" />
            </button>

            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-[#202123] px-4 text-sm font-medium text-white transition hover:bg-black"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-[1550px] px-5 pb-8 pt-8 sm:px-10 lg:px-[76px]">
          <div className="relative border-b border-[#333]">
            <Search
              size={21}
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#333]"
            />

            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedCollection(null);
                setSelectedArticle(null);
              }}
              placeholder="Search for articles..."
              aria-label="Search help articles"
              className="h-16 w-full min-w-0 bg-white pl-[59px] pr-12 text-base text-[#202123] outline-none placeholder:text-[#777] focus:border-[#202123]"
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#555] hover:bg-[#f2f2f2]"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto min-h-[65vh] w-full max-w-[1550px] px-5 pb-16 pt-5 sm:px-10 lg:px-[76px]">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#555]"
        >
          <button
            type="button"
            onClick={returnToHome}
            className="rounded-sm hover:text-black hover:underline"
          >
            All collections
          </button>

          {selectedCollection && (
            <>
              <ChevronRight size={15} aria-hidden="true" />
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="rounded-sm hover:text-black hover:underline"
              >
                {selectedCollection.title}
              </button>
            </>
          )}

          {selectedArticle && (
            <>
              <ChevronRight size={15} aria-hidden="true" />
              <span className="max-w-[320px] truncate text-[#202123]">
                {selectedArticle.title}
              </span>
            </>
          )}
        </nav>

        {query.trim() ? (
          <div className="w-full max-w-[1000px]">
            <h1 className="mb-5 text-2xl font-semibold tracking-[-0.7px]">
              Search results
            </h1>

            {searchResults.length > 0 ? (
              <div className="overflow-hidden rounded-[20px] border border-[#d4d4d4] divide-y divide-[#d4d4d4]">
                {searchResults.map((article) => (
                  <ArticleRow
                    key={`${article.collectionTitle}-${article.title}`}
                    article={article}
                    onClick={() => openSearchResult(article)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 text-center">
                <Search
                  size={27}
                  aria-hidden="true"
                  className="mx-auto mb-3 text-[#888]"
                />
                <h2 className="text-lg font-medium">No articles found</h2>
                <p className="mt-2 text-sm text-[#777]">
                  Try another search term.
                </p>
              </div>
            )}
          </div>
        ) : selectedArticle ? (
          <article className="w-full max-w-[850px]">
            <button
              type="button"
              onClick={goBack}
              className="mb-7 inline-flex items-center gap-2 text-sm text-[#555] hover:text-black"
            >
              <ArrowLeft size={16} />
              Back to articles
            </button>

            <div className="border-b border-[#dedede] pb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#e5e7eb] bg-[#f3f4f6] text-[#202123]">
                <FileText size={22} />
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.8px]">
                {selectedArticle.title}
              </h1>

              <p className="mt-3 text-base leading-7 text-[#666]">
                {selectedArticle.description}
              </p>
            </div>

            <div className="space-y-5 py-7">
              {selectedArticle.content.map((paragraph, index) => (
                <p
                  key={`${selectedArticle.title}-${index}`}
                  className="text-[15px] leading-7 text-[#444]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#e5e5e5] bg-[#f8f8f8] p-5">
              <p className="text-sm font-medium">
                Was this article helpful?
              </p>
              <p className="mt-1 text-sm text-[#777]">
                Feedback options can be connected in a later step.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#ddd] bg-white px-4 py-2 text-sm text-[#202123] hover:bg-[#f4f4f4]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#ddd] bg-white px-4 py-2 text-sm text-[#202123] hover:bg-[#f4f4f4]"
                >
                  No
                </button>
              </div>
            </div>
          </article>
        ) : selectedCollection ? (
          <div className="w-full max-w-[1000px]">
            <CollectionHeading collection={selectedCollection} />

            <div className="mt-8 overflow-hidden rounded-[20px] border border-[#d4d4d4] divide-y divide-[#d4d4d4]">
              {selectedCollection.articles.map((article) => (
                <ArticleRow
                  key={article.title}
                  article={article}
                  onClick={() => openArticle(article)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[1000px]">
            <div className="mb-14 flex items-center gap-5">
              <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-2xl border border-[#e5e7eb] bg-[#f3f4f6] text-[#202123] sm:h-[120px] sm:w-[120px]">
                <Sparkles size={42} strokeWidth={1.5} />
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-[-1px] sm:text-[40px]">
                  ModelNow
                </h1>
                <p className="mt-2 text-base text-[#555] sm:text-lg">
                  All things about ModelNow
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-[#d4d4d4] divide-y divide-[#d4d4d4]">
              {allArticles.map((article) => (
                <ArticleRow
                  key={`${article.collectionTitle}-${article.title}`}
                  article={article}
                  onClick={() => openSearchResult(article)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="w-full border-t border-[#eeeeee] bg-white">
        <div className="mx-auto flex w-full max-w-[1550px] flex-col gap-3 px-5 py-7 text-xs text-[#888] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-[76px]">
          <span>© {new Date().getFullYear()} ModelNow</span>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-[#333]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#333]">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-[#333]">
              ModelNow
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CollectionHeading({
  collection,
}: {
  collection: HelpCollection;
}) {
  const Icon = collection.icon;

  return (
    <div className="flex items-start gap-5 border-b border-[#dedede] pb-7">
      <span className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-2xl border border-[#e5e7eb] bg-[#f3f4f6] text-[#202123] sm:h-[120px] sm:w-[120px]">
        <Icon size={38} strokeWidth={1.5} />
      </span>

      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-[-1px] sm:text-[40px]">
          {collection.title}
        </h1>
        <p className="mt-2 text-base text-[#555] sm:text-lg">
          {collection.description}
        </p>
        <p className="mt-3 text-sm text-[#777]">
          {collection.articles.length} articles
        </p>
      </div>
    </div>
  );
}

function ArticleRow({
  article,
  onClick,
}: {
  article: HelpArticle;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[108px] w-full items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-[#fafafa] sm:px-7"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-[#202123] group-hover:underline sm:text-base">
          {article.title}
        </span>

        <span className="mt-2 block text-sm leading-6 text-[#555] sm:text-base">
          {article.description}
        </span>
      </span>

      <ChevronRight
        size={23}
        aria-hidden="true"
        className="shrink-0 text-[#444] transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}

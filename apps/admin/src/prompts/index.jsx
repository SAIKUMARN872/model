import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Prompt Management Module
 *
 * Responsibilities:
 * - Prompt templates
 * - Prompt versions
 * - Prompt variables
 * - Prompt rendering
 * - Prompt validation
 * - Prompt search and filtering
 * - Prompt lifecycle management
 * - React hooks and context
 */

/* -------------------------------------------------
   Constants
------------------------------------------------- */

export const PROMPT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  DISABLED: "disabled",
};

export const PROMPT_TYPES = {
  SYSTEM: "system",
  USER: "user",
  ASSISTANT: "assistant",
  TOOL: "tool",
  TEMPLATE: "template",
};

export const PROMPT_CATEGORIES = {
  GENERAL: "general",
  SUPPORT: "support",
  ANALYTICS: "analytics",
  SECURITY: "security",
  GOVERNANCE: "governance",
  CODING: "coding",
  CLASSIFICATION: "classification",
};

/* -------------------------------------------------
   ID Generator
------------------------------------------------- */

function generateId(
  prefix = "prompt"
) {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

/* -------------------------------------------------
   Prompt Normalizer
------------------------------------------------- */

export function normalizePrompt(
  prompt = {}
) {
  return {
    id:
      prompt.id ||
      generateId(),

    name:
      prompt.name ||
      "Untitled Prompt",

    slug:
      prompt.slug ||
      createSlug(
        prompt.name ||
          "untitled-prompt"
      ),

    description:
      prompt.description ||
      "",

    type:
      prompt.type ||
      PROMPT_TYPES.TEMPLATE,

    category:
      prompt.category ||
      PROMPT_CATEGORIES.GENERAL,

    content:
      prompt.content ||
      "",

    status:
      prompt.status ||
      PROMPT_STATUS.DRAFT,

    model:
      prompt.model ||
      null,

    temperature:
      prompt.temperature ??
      0.7,

    maxTokens:
      prompt.maxTokens ??
      null,

    variables:
      Array.isArray(
        prompt.variables
      )
        ? prompt.variables
        : extractVariables(
            prompt.content ||
              ""
          ),

    versions:
      Array.isArray(
        prompt.versions
      )
        ? prompt.versions
        : [],

    version:
      prompt.version ||
      1,

    tags:
      Array.isArray(
        prompt.tags
      )
        ? prompt.tags
        : [],

    ownerId:
      prompt.ownerId ||
      null,

    ownerName:
      prompt.ownerName ||
      "",

    metadata:
      prompt.metadata ||
      {},

    createdAt:
      prompt.createdAt ||
      new Date().toISOString(),

    updatedAt:
      prompt.updatedAt ||
      new Date().toISOString(),
  };
}

/* -------------------------------------------------
   Create Prompt
------------------------------------------------- */

export function createPrompt(
  data
) {
  const prompt =
    normalizePrompt(
      data
    );

  return {
    ...prompt,

    versions: [
      {
        id: generateId(
          "version"
        ),

        version: 1,

        content:
          prompt.content,

        createdAt:
          new Date().toISOString(),
      },
    ],
  };
}

/* -------------------------------------------------
   Update Prompt
------------------------------------------------- */

export function updatePrompt(
  prompt,
  updates
) {
  if (!prompt) {
    return null;
  }

  return normalizePrompt({
    ...prompt,
    ...updates,
    id: prompt.id,
    updatedAt:
      new Date().toISOString(),
  });
}

/* -------------------------------------------------
   Create Prompt Version
------------------------------------------------- */

export function createPromptVersion(
  prompt,
  content
) {
  if (!prompt) {
    return null;
  }

  const nextVersion =
    Number(
      prompt.version || 0
    ) + 1;

  const version = {
    id: generateId(
      "version"
    ),

    version:
      nextVersion,

    content,

    createdAt:
      new Date().toISOString(),
  };

  return {
    ...prompt,

    content,

    version:
      nextVersion,

    variables:
      extractVariables(
        content
      ),

    versions: [
      ...(prompt.versions ||
        []),
      version,
    ],

    updatedAt:
      new Date().toISOString(),
  };
}

/* -------------------------------------------------
   Get Prompt Version
------------------------------------------------- */

export function getPromptVersion(
  prompt,
  version
) {
  if (!prompt) {
    return null;
  }

  return (
    prompt.versions?.find(
      (item) =>
        item.version ===
        version
    ) || null
  );
}

/* -------------------------------------------------
   Render Prompt
------------------------------------------------- */

export function renderPrompt(
  content,
  variables = {}
) {
  if (
    typeof content !==
    "string"
  ) {
    return "";
  }

  return content.replace(
    /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,
    (
      match,
      variable
    ) => {
      const value =
        getNestedValue(
          variables,
          variable
        );

      return value ===
        undefined ||
        value === null
        ? match
        : String(value);
    }
  );
}

/* -------------------------------------------------
   Extract Variables
------------------------------------------------- */

export function extractVariables(
  content
) {
  if (
    typeof content !==
    "string"
  ) {
    return [];
  }

  const matches = [
    ...content.matchAll(
      /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g
    ),
  ];

  return [
    ...new Set(
      matches.map(
        (match) =>
          match[1]
      )
    ),
  ];
}

/* -------------------------------------------------
   Validate Prompt
------------------------------------------------- */

export function validatePrompt(
  prompt
) {
  const errors = {};

  if (
    !prompt ||
    typeof prompt !==
      "object"
  ) {
    return {
      valid: false,

      errors: {
        prompt:
          "Prompt must be an object.",
      },
    };
  }

  if (
    !prompt.name ||
    !String(
      prompt.name
    ).trim()
  ) {
    errors.name =
      "Prompt name is required.";
  }

  if (
    !prompt.content ||
    !String(
      prompt.content
    ).trim()
  ) {
    errors.content =
      "Prompt content is required.";
  }

  if (
    prompt.temperature !==
      undefined &&
    (
      prompt.temperature <
        0 ||
      prompt.temperature >
        2
    )
  ) {
    errors.temperature =
      "Temperature must be between 0 and 2.";
  }

  if (
    prompt.status &&
    !Object.values(
      PROMPT_STATUS
    ).includes(
      prompt.status
    )
  ) {
    errors.status =
      "Invalid prompt status.";
  }

  if (
    prompt.type &&
    !Object.values(
      PROMPT_TYPES
    ).includes(
      prompt.type
    )
  ) {
    errors.type =
      "Invalid prompt type.";
  }

  return {
    valid:
      Object.keys(
        errors
      ).length === 0,

    errors,
  };
}

/* -------------------------------------------------
   Search Prompts
------------------------------------------------- */

export function searchPrompts(
  prompts,
  query
) {
  const searchTerm =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!searchTerm) {
    return prompts;
  }

  return prompts.filter(
    (prompt) => {
      const searchableText =
        [
          prompt.id,
          prompt.name,
          prompt.slug,
          prompt.description,
          prompt.content,
          prompt.type,
          prompt.category,
          prompt.status,
          ...(prompt.tags ||
            []),
        ]
          .join(" ")
          .toLowerCase();

      return searchableText.includes(
        searchTerm
      );
    }
  );
}

/* -------------------------------------------------
   Filter Prompts
------------------------------------------------- */

export function filterPrompts(
  prompts,
  filters = {}
) {
  const {
    status = "all",
    type = "all",
    category = "all",
    ownerId = "all",
  } = filters;

  return prompts.filter(
    (prompt) => {
      const matchesStatus =
        status === "all" ||
        prompt.status ===
          status;

      const matchesType =
        type === "all" ||
        prompt.type ===
          type;

      const matchesCategory =
        category === "all" ||
        prompt.category ===
          category;

      const matchesOwner =
        ownerId === "all" ||
        prompt.ownerId ===
          ownerId;

      return (
        matchesStatus &&
        matchesType &&
        matchesCategory &&
        matchesOwner
      );
    }
  );
}

/* -------------------------------------------------
   Sort Prompts
------------------------------------------------- */

export function sortPrompts(
  prompts,
  field = "updatedAt",
  direction = "desc"
) {
  return [
    ...prompts,
  ].sort(
    (a, b) => {
      const valueA =
        a[field] || "";

      const valueB =
        b[field] || "";

      if (
        valueA <
        valueB
      ) {
        return direction ===
          "asc"
          ? -1
          : 1;
      }

      if (
        valueA >
        valueB
      ) {
        return direction ===
          "asc"
          ? 1
          : -1;
      }

      return 0;
    }
  );
}

/* -------------------------------------------------
   Delete Prompt
------------------------------------------------- */

export function deletePrompt(
  prompts,
  promptId
) {
  return prompts.filter(
    (prompt) =>
      prompt.id !==
      promptId
  );
}

/* -------------------------------------------------
   Activate Prompt
------------------------------------------------- */

export function activatePrompt(
  prompt
) {
  return updatePrompt(
    prompt,
    {
      status:
        PROMPT_STATUS.ACTIVE,
    }
  );
}

/* -------------------------------------------------
   Archive Prompt
------------------------------------------------- */

export function archivePrompt(
  prompt
) {
  return updatePrompt(
    prompt,
    {
      status:
        PROMPT_STATUS.ARCHIVED,
    }
  );
}

/* -------------------------------------------------
   Duplicate Prompt
------------------------------------------------- */

export function duplicatePrompt(
  prompt
) {
  if (!prompt) {
    return null;
  }

  return createPrompt({
    ...prompt,

    id: undefined,

    name: `${prompt.name} Copy`,

    slug: undefined,

    status:
      PROMPT_STATUS.DRAFT,

    version: 1,

    versions: [],
  });
}

/* -------------------------------------------------
   React Hook
------------------------------------------------- */

export function usePrompts(
  initialPrompts = []
) {
  const [
    prompts,
    setPrompts,
  ] = useState(
    initialPrompts.map(
      normalizePrompt
    )
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    filters,
    setFilters,
  ] = useState({
    status: "all",
    type: "all",
    category: "all",
    ownerId: "all",
  });

  const [
    sortField,
    setSortField,
  ] = useState(
    "updatedAt"
  );

  const [
    sortDirection,
    setSortDirection,
  ] = useState(
    "desc"
  );

  const filteredPrompts =
    useMemo(() => {
      let result =
        searchPrompts(
          prompts,
          searchQuery
        );

      result =
        filterPrompts(
          result,
          filters
        );

      result =
        sortPrompts(
          result,
          sortField,
          sortDirection
        );

      return result;
    }, [
      prompts,
      searchQuery,
      filters,
      sortField,
      sortDirection,
    ]);

  const addPrompt =
    useCallback(
      (data) => {
        const prompt =
          createPrompt(
            data
          );

        setPrompts(
          (current) => [
            ...current,
            prompt,
          ]
        );

        return prompt;
      },
      []
    );

  const updatePromptById =
    useCallback(
      (
        promptId,
        updates
      ) => {
        setPrompts(
          (current) =>
            current.map(
              (prompt) =>
                prompt.id ===
                promptId
                  ? updatePrompt(
                      prompt,
                      updates
                    )
                  : prompt
            )
        );
      },
      []
    );

  const deletePromptById =
    useCallback(
      (promptId) => {
        setPrompts(
          (current) =>
            deletePrompt(
              current,
              promptId
            )
        );
      },
      []
    );

  const addVersion =
    useCallback(
      (
        promptId,
        content
      ) => {
        setPrompts(
          (current) =>
            current.map(
              (prompt) =>
                prompt.id ===
                promptId
                  ? createPromptVersion(
                      prompt,
                      content
                    )
                  : prompt
            )
        );
      },
      []
    );

  const activate =
    useCallback(
      (promptId) => {
        setPrompts(
          (current) =>
            current.map(
              (prompt) =>
                prompt.id ===
                promptId
                  ? activatePrompt(
                      prompt
                    )
                  : prompt
            )
        );
      },
      []
    );

  const archive =
    useCallback(
      (promptId) => {
        setPrompts(
          (current) =>
            current.map(
              (prompt) =>
                prompt.id ===
                promptId
                  ? archivePrompt(
                      prompt
                    )
                  : prompt
            )
        );
      },
      []
    );

  const duplicate =
    useCallback(
      (promptId) => {
        const original =
          prompts.find(
            (prompt) =>
              prompt.id ===
              promptId
          );

        if (!original) {
          return null;
        }

        const copy =
          duplicatePrompt(
            original
          );

        setPrompts(
          (current) => [
            ...current,
            copy,
          ]
        );

        return copy;
      },
      [prompts]
    );

  return {
    prompts,

    filteredPrompts,

    searchQuery,

    setSearchQuery,

    filters,

    setFilters,

    sortField,

    setSortField,

    sortDirection,

    setSortDirection,

    addPrompt,

    updatePrompt:
      updatePromptById,

    deletePrompt:
      deletePromptById,

    addVersion,

    activate,

    archive,

    duplicate,
  };
}

/* -------------------------------------------------
   Prompt Context
------------------------------------------------- */

const PromptContext =
  createContext(null);

/* -------------------------------------------------
   Prompt Provider
------------------------------------------------- */

export function PromptProvider({
  initialPrompts = [],
  children,
}) {
  const promptManager =
    usePrompts(
      initialPrompts
    );

  return (
    <PromptContext.Provider
      value={
        promptManager
      }
    >
      {children}
    </PromptContext.Provider>
  );
}

/* -------------------------------------------------
   Prompt Context Hook
------------------------------------------------- */

export function usePromptContext() {
  const context =
    useContext(
      PromptContext
    );

  if (!context) {
    throw new Error(
      "usePromptContext must be used inside PromptProvider"
    );
  }

  return context;
}

/* -------------------------------------------------
   Helpers
------------------------------------------------- */

function createSlug(
  value
) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function getNestedValue(
  object,
  path
) {
  return path
    .split(".")
    .reduce(
      (current, key) =>
        current?.[key],
      object
    );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default {
  PROMPT_STATUS,

  PROMPT_TYPES,

  PROMPT_CATEGORIES,

  normalizePrompt,

  createPrompt,

  updatePrompt,

  createPromptVersion,

  getPromptVersion,

  renderPrompt,

  extractVariables,

  validatePrompt,

  searchPrompts,

  filterPrompts,

  sortPrompts,

  deletePrompt,

  activatePrompt,

  archivePrompt,

  duplicatePrompt,

  usePrompts,

  PromptProvider,

  usePromptContext,
};
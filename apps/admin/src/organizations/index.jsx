import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Organization Management
 *
 * Responsibilities:
 * - Organization CRUD
 * - Organization search
 * - Organization filtering
 * - Organization members
 * - Organization status
 * - Pagination
 * - Organization statistics
 */

/* -------------------------------------------------
   Constants
------------------------------------------------- */

export const ORGANIZATION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

export const ORGANIZATION_PLANS = {
  FREE: "free",
  STARTER: "starter",
  PROFESSIONAL: "professional",
  ENTERPRISE: "enterprise",
};

/* -------------------------------------------------
   ID Generator
------------------------------------------------- */

function generateId(
  prefix = "org"
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
   Organization Normalizer
------------------------------------------------- */

export function normalizeOrganization(
  organization = {}
) {
  return {
    id:
      organization.id ||
      generateId(),

    name:
      organization.name ||
      "Unnamed Organization",

    slug:
      organization.slug ||
      createSlug(
        organization.name ||
          "organization"
      ),

    description:
      organization.description ||
      "",

    status:
      organization.status ||
      ORGANIZATION_STATUS.ACTIVE,

    plan:
      organization.plan ||
      ORGANIZATION_PLANS.FREE,

    ownerId:
      organization.ownerId ||
      null,

    ownerName:
      organization.ownerName ||
      "",

    ownerEmail:
      organization.ownerEmail ||
      "",

    members:
      Array.isArray(
        organization.members
      )
        ? organization.members
        : [],

    memberCount:
      organization.memberCount ??
      organization.members?.length ??
      0,

    settings:
      organization.settings ||
      {},

    metadata:
      organization.metadata ||
      {},

    createdAt:
      organization.createdAt ||
      new Date().toISOString(),

    updatedAt:
      organization.updatedAt ||
      new Date().toISOString(),
  };
}

/* -------------------------------------------------
   Create Organization
------------------------------------------------- */

export function createOrganization(
  data
) {
  const organization =
    normalizeOrganization(
      data
    );

  return organization;
}

/* -------------------------------------------------
   Update Organization
------------------------------------------------- */

export function updateOrganization(
  organization,
  updates
) {
  if (!organization) {
    return null;
  }

  return normalizeOrganization({
    ...organization,
    ...updates,
    id: organization.id,
    updatedAt:
      new Date().toISOString(),
  });
}

/* -------------------------------------------------
   Delete Organization
------------------------------------------------- */

export function deleteOrganization(
  organizations,
  organizationId
) {
  return organizations.filter(
    (organization) =>
      organization.id !==
      organizationId
  );
}

/* -------------------------------------------------
   Find Organization
------------------------------------------------- */

export function getOrganization(
  organizations,
  organizationId
) {
  return (
    organizations.find(
      (organization) =>
        organization.id ===
        organizationId
    ) || null
  );
}

/* -------------------------------------------------
   Search Organizations
------------------------------------------------- */

export function searchOrganizations(
  organizations,
  query
) {
  const searchTerm =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!searchTerm) {
    return organizations;
  }

  return organizations.filter(
    (organization) => {
      const searchableText =
        [
          organization.id,
          organization.name,
          organization.slug,
          organization.description,
          organization.ownerName,
          organization.ownerEmail,
          organization.plan,
          organization.status,
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
   Filter Organizations
------------------------------------------------- */

export function filterOrganizations(
  organizations,
  filters = {}
) {
  const {
    status = "all",
    plan = "all",
    ownerId = "all",
  } = filters;

  return organizations.filter(
    (organization) => {
      const matchesStatus =
        status === "all" ||
        organization.status ===
          status;

      const matchesPlan =
        plan === "all" ||
        organization.plan ===
          plan;

      const matchesOwner =
        ownerId === "all" ||
        organization.ownerId ===
          ownerId;

      return (
        matchesStatus &&
        matchesPlan &&
        matchesOwner
      );
    }
  );
}

/* -------------------------------------------------
   Sort Organizations
------------------------------------------------- */

export function sortOrganizations(
  organizations,
  field = "createdAt",
  direction = "desc"
) {
  return [
    ...organizations,
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
   Pagination
------------------------------------------------- */

export function paginateOrganizations(
  organizations,
  page = 1,
  pageSize = 10
) {
  const total =
    organizations.length;

  const totalPages =
    Math.ceil(
      total / pageSize
    );

  const safePage =
    Math.min(
      Math.max(page, 1),
      Math.max(
        totalPages,
        1
      )
    );

  const start =
    (safePage - 1) *
    pageSize;

  return {
    data:
      organizations.slice(
        start,
        start + pageSize
      ),

    page: safePage,

    pageSize,

    total,

    totalPages,

    hasNext:
      safePage <
      totalPages,

    hasPrevious:
      safePage > 1,
  };
}

/* -------------------------------------------------
   Organization Statistics
------------------------------------------------- */

export function getOrganizationStats(
  organizations
) {
  const stats = {
    total: organizations.length,

    active: 0,

    inactive: 0,

    suspended: 0,

    pending: 0,

    totalMembers: 0,

    plans: {},
  };

  organizations.forEach(
    (organization) => {
      switch (
        organization.status
      ) {
        case ORGANIZATION_STATUS.ACTIVE:
          stats.active++;
          break;

        case ORGANIZATION_STATUS.INACTIVE:
          stats.inactive++;
          break;

        case ORGANIZATION_STATUS.SUSPENDED:
          stats.suspended++;
          break;

        case ORGANIZATION_STATUS.PENDING:
          stats.pending++;
          break;

        default:
          break;
      }

      stats.totalMembers +=
        Number(
          organization.memberCount ||
            organization.members
              ?.length ||
            0
        );

      const plan =
        organization.plan ||
        ORGANIZATION_PLANS.FREE;

      stats.plans[plan] =
        (stats.plans[plan] ||
          0) +
        1;
    }
  );

  return stats;
}

/* -------------------------------------------------
   Member Management
------------------------------------------------- */

export function addMember(
  organization,
  member
) {
  if (!organization) {
    return null;
  }

  const members = [
    ...(organization.members ||
      []),
    {
      id:
        member.id ||
        generateId(
          "member"
        ),

      name:
        member.name ||
        "",

      email:
        member.email ||
        "",

      role:
        member.role ||
        "member",

      joinedAt:
        member.joinedAt ||
        new Date().toISOString(),
    },
  ];

  return updateOrganization(
    organization,
    {
      members,
      memberCount:
        members.length,
    }
  );
}

export function removeMember(
  organization,
  memberId
) {
  if (!organization) {
    return null;
  }

  const members = (
    organization.members ||
    []
  ).filter(
    (member) =>
      member.id !==
      memberId
  );

  return updateOrganization(
    organization,
    {
      members,
      memberCount:
        members.length,
    }
  );
}

export function updateMember(
  organization,
  memberId,
  updates
) {
  if (!organization) {
    return null;
  }

  const members = (
    organization.members ||
    []
  ).map(
    (member) =>
      member.id ===
      memberId
        ? {
            ...member,
            ...updates,
          }
        : member
  );

  return updateOrganization(
    organization,
    {
      members,
      memberCount:
        members.length,
    }
  );
}

/* -------------------------------------------------
   React Hook
------------------------------------------------- */

export function useOrganizations(
  initialOrganizations = []
) {
  const [
    organizations,
    setOrganizations,
  ] = useState(
    initialOrganizations.map(
      normalizeOrganization
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
    plan: "all",
    ownerId: "all",
  });

  const [
    sortField,
    setSortField,
  ] = useState(
    "createdAt"
  );

  const [
    sortDirection,
    setSortDirection,
  ] = useState(
    "desc"
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(10);

  const filteredOrganizations =
    useMemo(() => {
      let result =
        searchOrganizations(
          organizations,
          searchQuery
        );

      result =
        filterOrganizations(
          result,
          filters
        );

      result =
        sortOrganizations(
          result,
          sortField,
          sortDirection
        );

      return result;
    }, [
      organizations,
      searchQuery,
      filters,
      sortField,
      sortDirection,
    ]);

  const pagination =
    useMemo(
      () =>
        paginateOrganizations(
          filteredOrganizations,
          page,
          pageSize
        ),
      [
        filteredOrganizations,
        page,
        pageSize,
      ]
    );

  const stats =
    useMemo(
      () =>
        getOrganizationStats(
          organizations
        ),
      [organizations]
    );

  const addOrganization =
    useCallback(
      (data) => {
        const organization =
          createOrganization(
            data
          );

        setOrganizations(
          (current) => [
            ...current,
            organization,
          ]
        );

        return organization;
      },
      []
    );

  const updateOrganizationById =
    useCallback(
      (
        organizationId,
        updates
      ) => {
        let updated = null;

        setOrganizations(
          (current) =>
            current.map(
              (organization) => {
                if (
                  organization.id !==
                  organizationId
                ) {
                  return organization;
                }

                updated =
                  updateOrganization(
                    organization,
                    updates
                  );

                return updated;
              }
            )
        );

        return updated;
      },
      []
    );

  const removeOrganization =
    useCallback(
      (organizationId) => {
        setOrganizations(
          (current) =>
            deleteOrganization(
              current,
              organizationId
            )
        );
      },
      []
    );

  const getById =
    useCallback(
      (organizationId) =>
        getOrganization(
          organizations,
          organizationId
        ),
      [organizations]
    );

  const addOrganizationMember =
    useCallback(
      (
        organizationId,
        member
      ) => {
        setOrganizations(
          (current) =>
            current.map(
              (organization) => {
                if (
                  organization.id !==
                  organizationId
                ) {
                  return organization;
                }

                return addMember(
                  organization,
                  member
                );
              }
            )
        );
      },
      []
    );

  const removeOrganizationMember =
    useCallback(
      (
        organizationId,
        memberId
      ) => {
        setOrganizations(
          (current) =>
            current.map(
              (organization) => {
                if (
                  organization.id !==
                  organizationId
                ) {
                  return organization;
                }

                return removeMember(
                  organization,
                  memberId
                );
              }
            )
        );
      },
      []
    );

  const resetFilters =
    useCallback(() => {
      setSearchQuery("");

      setFilters({
        status: "all",
        plan: "all",
        ownerId: "all",
      });

      setSortField(
        "createdAt"
      );

      setSortDirection(
        "desc"
      );

      setPage(1);
    }, []);

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    filters,
    pageSize,
  ]);

  return {
    organizations,

    filteredOrganizations,

    paginatedOrganizations:
      pagination.data,

    pagination,

    stats,

    searchQuery,
    setSearchQuery,

    filters,
    setFilters,

    sortField,
    setSortField,

    sortDirection,
    setSortDirection,

    page,
    setPage,

    pageSize,
    setPageSize,

    addOrganization,

    updateOrganization:
      updateOrganizationById,

    removeOrganization,

    getOrganization:
      getById,

    addMember:
      addOrganizationMember,

    removeMember:
      removeOrganizationMember,

    resetFilters,
  };
}

/* -------------------------------------------------
   Validation
------------------------------------------------- */

export function validateOrganization(
  organization
) {
  const errors = {};

  if (
    !organization ||
    typeof organization !==
      "object"
  ) {
    return {
      valid: false,
      errors: {
        organization:
          "Organization must be an object.",
      },
    };
  }

  if (
    !organization.name ||
    !String(
      organization.name
    ).trim()
  ) {
    errors.name =
      "Organization name is required.";
  }

  if (
    organization.ownerEmail &&
    !isValidEmail(
      organization.ownerEmail
    )
  ) {
    errors.ownerEmail =
      "Invalid owner email address.";
  }

  if (
    organization.status &&
    !Object.values(
      ORGANIZATION_STATUS
    ).includes(
      organization.status
    )
  ) {
    errors.status =
      "Invalid organization status.";
  }

  if (
    organization.plan &&
    !Object.values(
      ORGANIZATION_PLANS
    ).includes(
      organization.plan
    )
  ) {
    errors.plan =
      "Invalid organization plan.";
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

function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default {
  ORGANIZATION_STATUS,

  ORGANIZATION_PLANS,

  normalizeOrganization,

  createOrganization,

  updateOrganization,

  deleteOrganization,

  getOrganization,

  searchOrganizations,

  filterOrganizations,

  sortOrganizations,

  paginateOrganizations,

  getOrganizationStats,

  addMember,

  removeMember,

  updateMember,

  useOrganizations,

  validateOrganization,
};
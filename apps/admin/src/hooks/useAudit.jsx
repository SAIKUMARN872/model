import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Audit Event Types
 */
export const AUDIT_ACTIONS = {
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",

  ORGANIZATION_CREATED:
    "ORGANIZATION_CREATED",
  ORGANIZATION_UPDATED:
    "ORGANIZATION_UPDATED",
  ORGANIZATION_DELETED:
    "ORGANIZATION_DELETED",

  WORKSPACE_CREATED:
    "WORKSPACE_CREATED",
  WORKSPACE_UPDATED:
    "WORKSPACE_UPDATED",
  WORKSPACE_DELETED:
    "WORKSPACE_DELETED",

  API_KEY_CREATED:
    "API_KEY_CREATED",
  API_KEY_REVOKED:
    "API_KEY_REVOKED",

  SETTINGS_UPDATED:
    "SETTINGS_UPDATED",

  PERMISSION_CHANGED:
    "PERMISSION_CHANGED",
};

/**
 * Audit Event Status
 */
export const AUDIT_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
};

/**
 * Initial Audit Events
 */
const initialAuditEvents = [];

/**
 * Mock Audit API.
 *
 * Replace this with your actual:
 *
 * services/auditApi.jsx
 */
const auditApi = {
  getEvents: async ({
    organizationId,
    workspaceId,
  } = {}) => {
    return initialAuditEvents;
  },

  getEventById: async (
    eventId
  ) => {
    return initialAuditEvents.find(
      (event) =>
        event.id === eventId
    );
  },

  deleteEvent: async (
    eventId
  ) => {
    return {
      success: true,
      eventId,
    };
  },
};

/**
 * useAudit Hook
 */
export const useAudit = (
  options = {}
) => {
  const {
    organizationId = null,
    workspaceId = null,
    autoFetch = true,
  } = options;

  const [events, setEvents] =
    useState(
      initialAuditEvents
    );

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    actionFilter,
    setActionFilter,
  ] = useState("all");

  /**
   * Fetch audit events.
   */
  const fetchEvents =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await auditApi.getEvents({
            organizationId,
            workspaceId,
          });

        setEvents(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load audit events."
        );
      } finally {
        setLoading(false);
      }
    }, [
      organizationId,
      workspaceId,
    ]);

  /**
   * Get one audit event.
   */
  const getEventById =
    useCallback(
      async (eventId) => {
        if (!eventId) {
          return null;
        }

        try {
          setError(null);

          const event =
            await auditApi.getEventById(
              eventId
            );

          setSelectedEvent(
            event || null
          );

          return event;
        } catch (err) {
          const message =
            err?.message ||
            "Failed to load audit event.";

          setError(message);

          return null;
        }
      },
      []
    );

  /**
   * Select an event locally.
   */
  const selectEvent = useCallback(
    (event) => {
      setSelectedEvent(event);
    },
    []
  );

  /**
   * Clear selected event.
   */
  const clearSelectedEvent =
    useCallback(() => {
      setSelectedEvent(null);
    }, []);

  /**
   * Delete audit event.
   */
  const deleteEvent =
    useCallback(async (eventId) => {
      if (!eventId) {
        return {
          success: false,
          error:
            "Audit event ID is required.",
        };
      }

      try {
        setError(null);

        await auditApi.deleteEvent(
          eventId
        );

        setEvents(
          (currentEvents) =>
            currentEvents.filter(
              (event) =>
                event.id !== eventId
            )
        );

        if (
          selectedEvent?.id ===
          eventId
        ) {
          setSelectedEvent(null);
        }

        return {
          success: true,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to delete audit event.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    }, [selectedEvent]);

  /**
   * Refresh audit events.
   */
  const refresh =
    useCallback(async () => {
      await fetchEvents();
    }, [fetchEvents]);

  /**
   * Clear error.
   */
  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /**
   * Clear filters.
   */
  const clearFilters =
    useCallback(() => {
      setSearch("");
      setStatusFilter("all");
      setActionFilter("all");
    }, []);

  /**
   * Available audit actions.
   */
  const availableActions =
    useMemo(() => {
      return [
        ...new Set(
          events
            .map(
              (event) =>
                event.action
            )
            .filter(Boolean)
        ),
      ];
    }, [events]);

  /**
   * Filter audit events.
   */
  const filteredEvents =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return events.filter(
        (event) => {
          const matchesSearch =
            !searchValue ||
            event.action
              ?.toLowerCase()
              .includes(searchValue) ||
            event.description
              ?.toLowerCase()
              .includes(searchValue) ||
            event.actor?.name
              ?.toLowerCase()
              .includes(searchValue) ||
            event.actor?.email
              ?.toLowerCase()
              .includes(searchValue) ||
            event.resource?.name
              ?.toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            statusFilter ===
              "all" ||
            event.status ===
              statusFilter;

          const matchesAction =
            actionFilter ===
              "all" ||
            event.action ===
              actionFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesAction
          );
        }
      );
    }, [
      events,
      search,
      statusFilter,
      actionFilter,
    ]);

  /**
   * Audit statistics.
   */
  const statistics = useMemo(() => {
    const successful =
      events.filter(
        (event) =>
          event.status ===
          AUDIT_STATUS.SUCCESS
      ).length;

    const failed =
      events.filter(
        (event) =>
          event.status ===
          AUDIT_STATUS.FAILED
      ).length;

    return {
      total: events.length,
      successful,
      failed,
    };
  }, [events]);

  /**
   * Automatically fetch events.
   */
  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [
    autoFetch,
    fetchEvents,
  ]);

  return {
    // Data
    events,
    filteredEvents,
    selectedEvent,
    availableActions,

    // Statistics
    statistics,

    // Filters
    search,
    statusFilter,
    actionFilter,

    // State
    loading,
    error,

    // Filter actions
    setSearch,
    setStatusFilter,
    setActionFilter,
    clearFilters,

    // Event actions
    fetchEvents,
    getEventById,
    selectEvent,
    clearSelectedEvent,
    deleteEvent,
    refresh,
    clearError,
  };
};

export default useAudit;
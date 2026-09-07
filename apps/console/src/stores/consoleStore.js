import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import consoleApi from "../services/consoleApi";

/**
 * Console Store
 *
 * Responsible for:
 * - Console overview
 * - Dashboard metrics
 * - Dashboard activity
 * - Current user
 * - Organization
 * - Workspace
 * - Team members
 * - Activity feed
 * - Notifications
 * - System health
 * - Console configuration
 */

/**
 * Initial state.
 */
const initialState = {
  overview: null,

  dashboardMetrics: null,

  dashboardActivity: [],

  currentUser: null,

  organization: null,

  workspace: null,

  teamMembers: [],

  activityFeed: [],

  notifications: [],

  systemHealth: null,

  systemStatus: null,

  consoleConfig: null,

  featureFlags: {},

  regions: [],

  isLoading: false,

  isRefreshing: false,

  error: null,

  lastFetchedAt: null,
};

/**
 * Console Store.
 */
const useConsoleStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Set loading state.
         */
        setLoading: (isLoading) => {
          set(
            {
              isLoading,
            },
            false,
            "console/setLoading"
          );
        },

        /**
         * Set refreshing state.
         */
        setRefreshing: (isRefreshing) => {
          set(
            {
              isRefreshing,
            },
            false,
            "console/setRefreshing"
          );
        },

        /**
         * Set error.
         */
        setError: (error) => {
          set(
            {
              error:
                error?.message ||
                error ||
                "An unexpected error occurred.",
            },
            false,
            "console/setError"
          );
        },

        /**
         * Clear error.
         */
        clearError: () => {
          set(
            {
              error: null,
            },
            false,
            "console/clearError"
          );
        },

        /**
         * Fetch console overview.
         */
        fetchOverview: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchOverview/start"
            );

            const data =
              await consoleApi.getConsoleOverview(
                params
              );

            set(
              {
                overview: data,
                isLoading: false,
                lastFetchedAt:
                  new Date().toISOString(),
              },
              false,
              "console/fetchOverview/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch console overview.",
              },
              false,
              "console/fetchOverview/error"
            );

            throw error;
          }
        },

        /**
         * Fetch dashboard metrics.
         */
        fetchDashboardMetrics: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchDashboardMetrics/start"
            );

            const data =
              await consoleApi.getDashboardMetrics(
                params
              );

            set(
              {
                dashboardMetrics: data,
                isLoading: false,
              },
              false,
              "console/fetchDashboardMetrics/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch dashboard metrics.",
              },
              false,
              "console/fetchDashboardMetrics/error"
            );

            throw error;
          }
        },

        /**
         * Fetch dashboard activity.
         */
        fetchDashboardActivity: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchDashboardActivity/start"
            );

            const data =
              await consoleApi.getDashboardActivity(
                params
              );

            set(
              {
                dashboardActivity:
                  Array.isArray(data)
                    ? data
                    : data?.items || [],
                isLoading: false,
              },
              false,
              "console/fetchDashboardActivity/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch dashboard activity.",
              },
              false,
              "console/fetchDashboardActivity/error"
            );

            throw error;
          }
        },

        /**
         * Fetch current user.
         */
        fetchCurrentUser: async () => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchCurrentUser/start"
            );

            const data =
              await consoleApi.getCurrentUser();

            set(
              {
                currentUser: data,
                isLoading: false,
              },
              false,
              "console/fetchCurrentUser/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch current user.",
              },
              false,
              "console/fetchCurrentUser/error"
            );

            throw error;
          }
        },

        /**
         * Update current user.
         */
        updateCurrentUser: async (
          userData
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/updateCurrentUser/start"
            );

            const data =
              await consoleApi.updateCurrentUser(
                userData
              );

            set(
              {
                currentUser: data,
                isLoading: false,
              },
              false,
              "console/updateCurrentUser/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to update current user.",
              },
              false,
              "console/updateCurrentUser/error"
            );

            throw error;
          }
        },

        /**
         * Fetch organization.
         */
        fetchOrganization: async () => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchOrganization/start"
            );

            const data =
              await consoleApi.getOrganization();

            set(
              {
                organization: data,
                isLoading: false,
              },
              false,
              "console/fetchOrganization/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch organization.",
              },
              false,
              "console/fetchOrganization/error"
            );

            throw error;
          }
        },

        /**
         * Update organization.
         */
        updateOrganization: async (
          organizationData
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/updateOrganization/start"
            );

            const data =
              await consoleApi.updateOrganization(
                organizationData
              );

            set(
              {
                organization: data,
                isLoading: false,
              },
              false,
              "console/updateOrganization/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to update organization.",
              },
              false,
              "console/updateOrganization/error"
            );

            throw error;
          }
        },

        /**
         * Fetch workspace.
         */
        fetchWorkspace: async () => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchWorkspace/start"
            );

            const data =
              await consoleApi.getWorkspace();

            set(
              {
                workspace: data,
                isLoading: false,
              },
              false,
              "console/fetchWorkspace/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch workspace.",
              },
              false,
              "console/fetchWorkspace/error"
            );

            throw error;
          }
        },

        /**
         * Update workspace.
         */
        updateWorkspace: async (
          workspaceData
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/updateWorkspace/start"
            );

            const data =
              await consoleApi.updateWorkspace(
                workspaceData
              );

            set(
              {
                workspace: data,
                isLoading: false,
              },
              false,
              "console/updateWorkspace/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to update workspace.",
              },
              false,
              "console/updateWorkspace/error"
            );

            throw error;
          }
        },

        /**
         * Fetch team members.
         */
        fetchTeamMembers: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchTeamMembers/start"
            );

            const data =
              await consoleApi.getTeamMembers(
                params
              );

            set(
              {
                teamMembers:
                  Array.isArray(data)
                    ? data
                    : data?.items || [],
                isLoading: false,
              },
              false,
              "console/fetchTeamMembers/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch team members.",
              },
              false,
              "console/fetchTeamMembers/error"
            );

            throw error;
          }
        },

        /**
         * Invite team member.
         */
        inviteTeamMember: async (
          invitationData
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/inviteTeamMember/start"
            );

            const data =
              await consoleApi.inviteTeamMember(
                invitationData
              );

            set(
              {
                isLoading: false,
              },
              false,
              "console/inviteTeamMember/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to invite team member.",
              },
              false,
              "console/inviteTeamMember/error"
            );

            throw error;
          }
        },

        /**
         * Update team member role.
         */
        updateTeamMemberRole: async (
          memberId,
          roleData
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/updateTeamMemberRole/start"
            );

            const data =
              await consoleApi.updateTeamMemberRole(
                memberId,
                roleData
              );

            set(
              (state) => ({
                teamMembers:
                  state.teamMembers.map(
                    (member) =>
                      member.id === memberId
                        ? {
                            ...member,
                            ...data,
                          }
                        : member
                  ),
                isLoading: false,
              }),
              false,
              "console/updateTeamMemberRole/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to update team member role.",
              },
              false,
              "console/updateTeamMemberRole/error"
            );

            throw error;
          }
        },

        /**
         * Remove team member.
         */
        removeTeamMember: async (
          memberId
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/removeTeamMember/start"
            );

            const data =
              await consoleApi.removeTeamMember(
                memberId
              );

            set(
              (state) => ({
                teamMembers:
                  state.teamMembers.filter(
                    (member) =>
                      member.id !== memberId
                  ),
                isLoading: false,
              }),
              false,
              "console/removeTeamMember/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to remove team member.",
              },
              false,
              "console/removeTeamMember/error"
            );

            throw error;
          }
        },

        /**
         * Fetch activity feed.
         */
        fetchActivityFeed: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "console/fetchActivityFeed/start"
            );

            const data =
              await consoleApi.getActivityFeed(
                params
              );

            set(
              {
                activityFeed:
                  Array.isArray(data)
                    ? data
                    : data?.items || [],
                isLoading: false,
              },
              false,
              "console/fetchActivityFeed/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,
                error:
                  error?.message ||
                  "Failed to fetch activity feed.",
              },
              false,
              "console/fetchActivityFeed/error"
            );

            throw error;
          }
        },

        /**
         * Fetch system health.
         */
        fetchSystemHealth: async () => {
          try {
            const data =
              await consoleApi.getSystemHealth();

            set(
              {
                systemHealth: data,
              },
              false,
              "console/fetchSystemHealth/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch system health.",
              },
              false,
              "console/fetchSystemHealth/error"
            );

            throw error;
          }
        },

        /**
         * Fetch system status.
         */
        fetchSystemStatus: async () => {
          try {
            const data =
              await consoleApi.getSystemStatus();

            set(
              {
                systemStatus: data,
              },
              false,
              "console/fetchSystemStatus/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch system status.",
              },
              false,
              "console/fetchSystemStatus/error"
            );

            throw error;
          }
        },

        /**
         * Fetch notifications.
         */
        fetchNotifications: async (
          params = {}
        ) => {
          try {
            const data =
              await consoleApi.getNotifications(
                params
              );

            set(
              {
                notifications:
                  Array.isArray(data)
                    ? data
                    : data?.items || [],
              },
              false,
              "console/fetchNotifications/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch notifications.",
              },
              false,
              "console/fetchNotifications/error"
            );

            throw error;
          }
        },

        /**
         * Mark notification as read.
         */
        markNotificationAsRead:
          async (notificationId) => {
            try {
              const data =
                await consoleApi.markNotificationAsRead(
                  notificationId
                );

              set(
                (state) => ({
                  notifications:
                    state.notifications.map(
                      (notification) =>
                        notification.id ===
                        notificationId
                          ? {
                              ...notification,
                              read: true,
                              isRead: true,
                            }
                          : notification
                    ),
                }),
                false,
                "console/markNotificationAsRead/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to mark notification as read.",
                },
                false,
                "console/markNotificationAsRead/error"
              );

              throw error;
            }
          },

        /**
         * Mark all notifications as read.
         */
        markAllNotificationsAsRead:
          async () => {
            try {
              const data =
                await consoleApi.markAllNotificationsAsRead();

              set(
                (state) => ({
                  notifications:
                    state.notifications.map(
                      (notification) => ({
                        ...notification,
                        read: true,
                        isRead: true,
                      })
                    ),
                }),
                false,
                "console/markAllNotificationsAsRead/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to mark all notifications as read.",
                },
                false,
                "console/markAllNotificationsAsRead/error"
              );

              throw error;
            }
          },

        /**
         * Fetch console configuration.
         */
        fetchConsoleConfig: async () => {
          try {
            const data =
              await consoleApi.getConsoleConfig();

            set(
              {
                consoleConfig: data,
              },
              false,
              "console/fetchConsoleConfig/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch console configuration.",
              },
              false,
              "console/fetchConsoleConfig/error"
            );

            throw error;
          }
        },

        /**
         * Fetch feature flags.
         */
        fetchFeatureFlags: async () => {
          try {
            const data =
              await consoleApi.getFeatureFlags();

            set(
              {
                featureFlags:
                  data || {},
              },
              false,
              "console/fetchFeatureFlags/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch feature flags.",
              },
              false,
              "console/fetchFeatureFlags/error"
            );

            throw error;
          }
        },

        /**
         * Fetch available regions.
         */
        fetchRegions: async () => {
          try {
            const data =
              await consoleApi.getRegions();

            set(
              {
                regions:
                  Array.isArray(data)
                    ? data
                    : data?.items || [],
              },
              false,
              "console/fetchRegions/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch regions.",
              },
              false,
              "console/fetchRegions/error"
            );

            throw error;
          }
        },

        /**
         * Refresh all major console data.
         */
        refreshConsole: async (
          params = {}
        ) => {
          try {
            set(
              {
                isRefreshing: true,
                error: null,
              },
              false,
              "console/refreshConsole/start"
            );

            const [
              overview,
              dashboardMetrics,
              dashboardActivity,
              activityFeed,
              systemHealth,
              systemStatus,
            ] = await Promise.all([
              consoleApi.getConsoleOverview(
                params
              ),
              consoleApi.getDashboardMetrics(
                params
              ),
              consoleApi.getDashboardActivity(
                params
              ),
              consoleApi.getActivityFeed(
                params
              ),
              consoleApi.getSystemHealth(),
              consoleApi.getSystemStatus(),
            ]);

            set(
              {
                overview,

                dashboardMetrics,

                dashboardActivity:
                  Array.isArray(
                    dashboardActivity
                  )
                    ? dashboardActivity
                    : dashboardActivity?.items ||
                      [],

                activityFeed:
                  Array.isArray(activityFeed)
                    ? activityFeed
                    : activityFeed?.items ||
                      [],

                systemHealth,

                systemStatus,

                isRefreshing: false,

                lastFetchedAt:
                  new Date().toISOString(),
              },
              false,
              "console/refreshConsole/success"
            );

            return {
              overview,
              dashboardMetrics,
              dashboardActivity,
              activityFeed,
              systemHealth,
              systemStatus,
            };
          } catch (error) {
            set(
              {
                isRefreshing: false,
                error:
                  error?.message ||
                  "Failed to refresh console data.",
              },
              false,
              "console/refreshConsole/error"
            );

            throw error;
          }
        },

        /**
         * Reset store.
         */
        reset: () => {
          set(
            {
              ...initialState,
            },
            false,
            "console/reset"
          );
        },
      }),
      {
        name: "console-store",

        partialize: (state) => ({
          currentUser:
            state.currentUser,

          organization:
            state.organization,

          workspace:
            state.workspace,

          featureFlags:
            state.featureFlags,

          consoleConfig:
            state.consoleConfig,
        }),
      }
    ),
    {
      name: "ConsoleStore",
    }
  )
);

export default useConsoleStore;
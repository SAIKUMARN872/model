// services/analytics/dashboards/dashboard.ts

import {
  createWidget,
  type CreateWidgetInput,
  type DashboardWidget,
  updateWidget,
} from "./widgets.js";

export interface Dashboard {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDashboardInput {
  organizationId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface UpdateDashboardInput {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

export interface DashboardFilter {
  organizationId?: string;
  isDefault?: boolean;
  name?: string;
}

export interface DashboardManagerOptions {
  maxDashboardsPerOrganization?: number;
  maxWidgetsPerDashboard?: number;
  retentionLimit?: number;
}

export interface DashboardHealth {
  healthy: boolean;
  dashboards: number;
  organizations: number;
  maxDashboardsPerOrganization: number;
  maxWidgetsPerDashboard: number;
}

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} cannot be empty`);
  }
}

function generateId(): string {
  return `dashboard_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export class DashboardManager {
  private readonly dashboards = new Map<string, Dashboard>();

  private readonly maxDashboardsPerOrganization: number;

  private readonly maxWidgetsPerDashboard: number;

  private readonly retentionLimit: number;

  constructor(options: DashboardManagerOptions = {}) {
    this.maxDashboardsPerOrganization =
      options.maxDashboardsPerOrganization ?? 50;

    this.maxWidgetsPerDashboard =
      options.maxWidgetsPerDashboard ?? 50;

    this.retentionLimit =
      options.retentionLimit ?? 1000;

    if (
      !Number.isInteger(this.maxDashboardsPerOrganization) ||
      this.maxDashboardsPerOrganization <= 0
    ) {
      throw new Error(
        "maxDashboardsPerOrganization must be a positive integer",
      );
    }

    if (
      !Number.isInteger(this.maxWidgetsPerDashboard) ||
      this.maxWidgetsPerDashboard <= 0
    ) {
      throw new Error(
        "maxWidgetsPerDashboard must be a positive integer",
      );
    }

    if (
      !Number.isInteger(this.retentionLimit) ||
      this.retentionLimit <= 0
    ) {
      throw new Error(
        "retentionLimit must be a positive integer",
      );
    }
  }

  createDashboard(
    input: CreateDashboardInput,
  ): Dashboard {
    assertNonEmpty(
      input.organizationId,
      "Organization ID",
    );

    assertNonEmpty(input.name, "Dashboard name");

    const organizationDashboards =
      this.getByOrganization(input.organizationId);

    if (
      organizationDashboards.length >=
      this.maxDashboardsPerOrganization
    ) {
      throw new Error(
        `Dashboard limit exceeded for organization: ${input.organizationId}`,
      );
    }

    const now = new Date().toISOString();

    const dashboard: Dashboard = {
      id: generateId(),
      organizationId: input.organizationId.trim(),
      name: input.name.trim(),
      description: input.description?.trim(),
      widgets: [],
      isDefault: input.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    };

    if (dashboard.isDefault) {
      this.clearDefault(
        dashboard.organizationId,
      );
    }

    this.dashboards.set(
      dashboard.id,
      dashboard,
    );

    this.enforceRetention();

    return this.cloneDashboard(dashboard);
  }

  getDashboard(
    organizationId: string,
    dashboardId: string,
  ): Dashboard | undefined {
    assertNonEmpty(organizationId, "Organization ID");
    assertNonEmpty(dashboardId, "Dashboard ID");

    const dashboard =
      this.dashboards.get(dashboardId);

    if (
      !dashboard ||
      dashboard.organizationId !==
        organizationId.trim()
    ) {
      return undefined;
    }

    return this.cloneDashboard(dashboard);
  }

  getByOrganization(
    organizationId: string,
  ): Dashboard[] {
    assertNonEmpty(organizationId, "Organization ID");

    return Array.from(this.dashboards.values())
      .filter(
        (dashboard) =>
          dashboard.organizationId ===
          organizationId.trim(),
      )
      .map((dashboard) =>
        this.cloneDashboard(dashboard),
      );
  }

  list(
    filter: DashboardFilter = {},
  ): Dashboard[] {
    if (filter.organizationId !== undefined) {
      assertNonEmpty(
        filter.organizationId,
        "Organization ID",
      );
    }

    return Array.from(this.dashboards.values())
      .filter((dashboard) => {
        if (
          filter.organizationId !== undefined &&
          dashboard.organizationId !==
            filter.organizationId.trim()
        ) {
          return false;
        }

        if (
          filter.isDefault !== undefined &&
          dashboard.isDefault !== filter.isDefault
        ) {
          return false;
        }

        if (
          filter.name !== undefined &&
          !dashboard.name
            .toLowerCase()
            .includes(filter.name.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .map((dashboard) =>
        this.cloneDashboard(dashboard),
      );
  }

  updateDashboard(
    organizationId: string,
    dashboardId: string,
    updates: UpdateDashboardInput,
  ): Dashboard {
    const dashboard = this.requireDashboard(
      organizationId,
      dashboardId,
    );

    if (updates.name !== undefined) {
      assertNonEmpty(
        updates.name,
        "Dashboard name",
      );

      dashboard.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      dashboard.description =
        updates.description.trim();
    }

    if (updates.isDefault !== undefined) {
      dashboard.isDefault = updates.isDefault;

      if (updates.isDefault) {
        this.clearDefault(
          dashboard.organizationId,
          dashboard.id,
        );
      }
    }

    dashboard.updatedAt =
      new Date().toISOString();

    this.dashboards.set(
      dashboard.id,
      dashboard,
    );

    return this.cloneDashboard(dashboard);
  }

  deleteDashboard(
    organizationId: string,
    dashboardId: string,
  ): boolean {
    const dashboard = this.requireDashboard(
      organizationId,
      dashboardId,
    );

    return this.dashboards.delete(dashboard.id);
  }

  addWidget(
    organizationId: string,
    dashboardId: string,
    input: CreateWidgetInput,
  ): DashboardWidget {
    const dashboard = this.requireDashboard(
      organizationId,
      dashboardId,
    );

    if (
      dashboard.widgets.length >=
      this.maxWidgetsPerDashboard
    ) {
      throw new Error(
        `Widget limit exceeded for dashboard: ${dashboardId}`,
      );
    }

    const widget = createWidget(input);

    dashboard.widgets.push(widget);

    dashboard.updatedAt =
      new Date().toISOString();

    return {
      ...widget,
      position: { ...widget.position },
      config: { ...widget.config },
    };
  }

  getWidget(
    organizationId: string,
    dashboardId: string,
    widgetId: string,
  ): DashboardWidget | undefined {
    const dashboard = this.getDashboard(
      organizationId,
      dashboardId,
    );

    if (!dashboard) {
      return undefined;
    }

    const widget = dashboard.widgets.find(
      (item) => item.id === widgetId,
    );

    if (!widget) {
      return undefined;
    }

    return {
      ...widget,
      position: { ...widget.position },
      config: { ...widget.config },
    };
  }

  updateWidget(
    organizationId: string,
    dashboardId: string,
    widgetId: string,
    updates: Partial<
      Omit<DashboardWidget, "id" | "createdAt">
    >,
  ): DashboardWidget {
    const dashboard = this.requireDashboard(
      organizationId,
      dashboardId,
    );

    const index = dashboard.widgets.findIndex(
      (widget) => widget.id === widgetId,
    );

    if (index === -1) {
      throw new Error(
        `Widget not found: ${widgetId}`,
      );
    }

    const updated = updateWidget(
      dashboard.widgets[index],
      updates,
    );

    dashboard.widgets[index] = updated;

    dashboard.updatedAt =
      new Date().toISOString();

    return {
      ...updated,
      position: { ...updated.position },
      config: { ...updated.config },
    };
  }

  removeWidget(
    organizationId: string,
    dashboardId: string,
    widgetId: string,
  ): boolean {
    const dashboard = this.requireDashboard(
      organizationId,
      dashboardId,
    );

    const index = dashboard.widgets.findIndex(
      (widget) => widget.id === widgetId,
    );

    if (index === -1) {
      return false;
    }

    dashboard.widgets.splice(index, 1);

    dashboard.updatedAt =
      new Date().toISOString();

    return true;
  }

  clearWidgets(
    organizationId: string,
    dashboardId: string,
  ): void {
    const dashboard = this.requireDashboard(
      organizationId,
      dashboardId,
    );

    dashboard.widgets = [];

    dashboard.updatedAt =
      new Date().toISOString();
  }

  getDefault(
    organizationId: string,
  ): Dashboard | undefined {
    return this.getByOrganization(
      organizationId,
    ).find(
      (dashboard) => dashboard.isDefault,
    );
  }

  size(): number {
    return this.dashboards.size;
  }

  clearOrganization(
    organizationId: string,
  ): number {
    assertNonEmpty(organizationId, "Organization ID");

    let removed = 0;

    for (const [
      dashboardId,
      dashboard,
    ] of this.dashboards.entries()) {
      if (
        dashboard.organizationId ===
        organizationId.trim()
      ) {
        this.dashboards.delete(dashboardId);
        removed += 1;
      }
    }

    return removed;
  }

  clear(): void {
    this.dashboards.clear();
  }

  health(): DashboardHealth {
    const organizations = new Set(
      Array.from(this.dashboards.values()).map(
        (dashboard) =>
          dashboard.organizationId,
      ),
    );

    return {
      healthy:
        this.dashboards.size <=
        this.retentionLimit,
      dashboards: this.dashboards.size,
      organizations: organizations.size,
      maxDashboardsPerOrganization:
        this.maxDashboardsPerOrganization,
      maxWidgetsPerDashboard:
        this.maxWidgetsPerDashboard,
    };
  }

  private requireDashboard(
    organizationId: string,
    dashboardId: string,
  ): Dashboard {
    assertNonEmpty(
      organizationId,
      "Organization ID",
    );

    assertNonEmpty(
      dashboardId,
      "Dashboard ID",
    );

    const dashboard =
      this.dashboards.get(dashboardId);

    if (
      !dashboard ||
      dashboard.organizationId !==
        organizationId.trim()
    ) {
      throw new Error(
        `Dashboard not found: ${dashboardId}`,
      );
    }

    return dashboard;
  }

  private clearDefault(
    organizationId: string,
    exceptDashboardId?: string,
  ): void {
    for (const dashboard of this.dashboards.values()) {
      if (
        dashboard.organizationId ===
          organizationId &&
        dashboard.id !== exceptDashboardId &&
        dashboard.isDefault
      ) {
        dashboard.isDefault = false;
        dashboard.updatedAt =
          new Date().toISOString();
      }
    }
  }

  private enforceRetention(): void {
    while (
      this.dashboards.size >
      this.retentionLimit
    ) {
      const oldest = Array.from(
        this.dashboards.values(),
      ).sort(
        (a, b) =>
          Date.parse(a.createdAt) -
          Date.parse(b.createdAt),
      )[0];

      if (!oldest) {
        break;
      }

      this.dashboards.delete(oldest.id);
    }
  }

  private cloneDashboard(
    dashboard: Dashboard,
  ): Dashboard {
    return {
      ...dashboard,
      widgets: dashboard.widgets.map(
        (widget) => ({
          ...widget,
          position: {
            ...widget.position,
          },
          config: {
            ...widget.config,
          },
        }),
      ),
    };
  }
}
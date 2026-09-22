// services/analytics/dashboards/index.ts

export {
  DashboardManager,
  type Dashboard,
  type CreateDashboardInput,
  type UpdateDashboardInput,
  type DashboardFilter,
  type DashboardManagerOptions,
  type DashboardHealth,
} from "./dashboard.js";

export {
  createWidget,
  updateWidget,
  cloneWidget,
  validateWidgetType,
  validateWidgetSize,
  type DashboardWidget,
  type CreateWidgetInput,
  type WidgetType,
  type WidgetSize,
  type WidgetPosition,
  type WidgetConfig,
} from "./widgets.js";
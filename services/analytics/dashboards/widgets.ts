// services/analytics/dashboards/widgets.ts

export type WidgetType =
  | "metric"
  | "line"
  | "bar"
  | "area"
  | "table"
  | "pie";

export type WidgetSize = "small" | "medium" | "large";

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetConfig {
  metric?: string;
  metrics?: string[];
  title?: string;
  description?: string;
  unit?: string;
  refreshIntervalSeconds?: number;
  filters?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  config: WidgetConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWidgetInput {
  type: WidgetType;
  title: string;
  size?: WidgetSize;
  position?: Partial<WidgetPosition>;
  config?: WidgetConfig;
}

const WIDGET_TYPES: readonly WidgetType[] = [
  "metric",
  "line",
  "bar",
  "area",
  "table",
  "pie",
];

const WIDGET_SIZES: readonly WidgetSize[] = [
  "small",
  "medium",
  "large",
];

function assertNonEmpty(value: string, field: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} cannot be empty`);
  }
}

function assertNonNegativeInteger(
  value: number,
  field: string,
): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
}

function generateId(): string {
  return `widget_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function validateWidgetType(type: WidgetType): void {
  if (!WIDGET_TYPES.includes(type)) {
    throw new Error(`Unsupported widget type: ${type}`);
  }
}

export function validateWidgetSize(size: WidgetSize): void {
  if (!WIDGET_SIZES.includes(size)) {
    throw new Error(`Unsupported widget size: ${size}`);
  }
}

export function createWidget(
  input: CreateWidgetInput,
): DashboardWidget {
  assertNonEmpty(input.title, "Widget title");

  validateWidgetType(input.type);

  const size = input.size ?? "medium";

  validateWidgetSize(size);

  const position: WidgetPosition = {
    x: input.position?.x ?? 0,
    y: input.position?.y ?? 0,
    width: input.position?.width ?? 4,
    height: input.position?.height ?? 3,
  };

  assertNonNegativeInteger(position.x, "Widget x");
  assertNonNegativeInteger(position.y, "Widget y");

  if (!Number.isInteger(position.width) || position.width <= 0) {
    throw new Error("Widget width must be a positive integer");
  }

  if (!Number.isInteger(position.height) || position.height <= 0) {
    throw new Error("Widget height must be a positive integer");
  }

  const now = new Date().toISOString();

  return {
    id: generateId(),
    type: input.type,
    title: input.title.trim(),
    size,
    position,
    config: input.config ?? {},
    createdAt: now,
    updatedAt: now,
  };
}

export function updateWidget(
  widget: DashboardWidget,
  updates: Partial<Omit<DashboardWidget, "id" | "createdAt">>,
): DashboardWidget {
  if (updates.title !== undefined) {
    assertNonEmpty(updates.title, "Widget title");
  }

  if (updates.type !== undefined) {
    validateWidgetType(updates.type);
  }

  if (updates.size !== undefined) {
    validateWidgetSize(updates.size);
  }

  const position = {
    ...widget.position,
    ...(updates.position ?? {}),
  };

  assertNonNegativeInteger(position.x, "Widget x");
  assertNonNegativeInteger(position.y, "Widget y");

  if (position.width <= 0 || !Number.isInteger(position.width)) {
    throw new Error("Widget width must be a positive integer");
  }

  if (position.height <= 0 || !Number.isInteger(position.height)) {
    throw new Error("Widget height must be a positive integer");
  }

  return {
    ...widget,
    ...updates,
    position,
    title: updates.title?.trim() ?? widget.title,
    updatedAt: new Date().toISOString(),
  };
}

export function cloneWidget(
  widget: DashboardWidget,
): DashboardWidget {
  return {
    ...widget,
    position: { ...widget.position },
    config: { ...widget.config },
  };
}
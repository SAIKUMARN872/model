import { randomBytes } from "node:crypto";

export interface TraceContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly traceFlags: string;
}

const TRACEPARENT_V00 =
  /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

function nonZeroHex(value: string): boolean {
  return !/^0+$/.test(value);
}

/** Accepts only valid W3C traceparent version 00 values. */
export function parseTraceparent(value: unknown): TraceContext | undefined {
  if (typeof value !== "string" || value.length !== 55) {
    return undefined;
  }

  const match = TRACEPARENT_V00.exec(value);
  if (!match) return undefined;

  const [, traceId, spanId, traceFlags] = match;

  if (
    !traceId || !spanId || !traceFlags ||
    !nonZeroHex(traceId) ||
    !nonZeroHex(spanId)
  ) {
    return undefined;
  }

  return Object.freeze({ traceId, spanId, traceFlags });
}

/** Creates local trace identifiers, without claiming to export spans. */
export function createTraceContext(): TraceContext {
  return Object.freeze({
    traceId: randomBytes(16).toString("hex"),
    spanId: randomBytes(8).toString("hex"),
    traceFlags: "00",
  });
}

export function formatTraceparent(context: TraceContext): string {
  const value =
    `00-${context.traceId}-${context.spanId}-${context.traceFlags}`;

  if (!parseTraceparent(value)) {
    throw new TypeError("Invalid trace context.");
  }

  return value;
}
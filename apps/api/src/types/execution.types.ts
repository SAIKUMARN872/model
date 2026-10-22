import type { z } from "zod";
import {
  executionRequestSchema,
  executionResponseSchema,
  executionStatusSchema,
} from "../schemas/execution.schema.js";

export type ExecutionRequest = z.infer<typeof executionRequestSchema>;
export type ExecutionResponse = z.infer<typeof executionResponseSchema>;
export type ExecutionStatus = z.infer<typeof executionStatusSchema>;

export interface ExecutionFailure {
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
}

export interface ExecutionTiming {
  readonly queuedAt?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
}

export interface ExecutionRecord {
  readonly executionId: string;
  readonly status: ExecutionStatus;
  readonly timing: ExecutionTiming;
  readonly result?: ExecutionResponse;
  readonly failure?: ExecutionFailure;
}

export interface ExecutionCancellation {
  readonly executionId: string;
  readonly cancelled: boolean;
}

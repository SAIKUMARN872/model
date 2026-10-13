import { ValidationError } from "./exceptions.js";
import type { ActionInput, ComputerDevice } from "./interfaces.js";

export function validateComputer(input: ComputerDevice): void {
  if (!input.id.trim()) throw new ValidationError("Computer id is required");
  if (!input.name.trim()) throw new ValidationError("Computer name is required");
  if (!Number.isInteger(input.width) || input.width <= 0) {
    throw new ValidationError("Computer width must be a positive integer");
  }
  if (!Number.isInteger(input.height) || input.height <= 0) {
    throw new ValidationError("Computer height must be a positive integer");
  }
}

export function validateAction(input: ActionInput): void {
  if (!input || typeof input.type !== "string" || !input.type.trim()) {
    throw new ValidationError("Action type is required");
  }
  for (const coordinate of [input.x, input.y, input.deltaX, input.deltaY]) {
    if (coordinate !== undefined && !Number.isFinite(coordinate)) {
      throw new ValidationError("Action coordinates must be finite numbers");
    }
  }
  if (input.type === "type" && typeof input.text !== "string") {
    throw new ValidationError("Text action requires text");
  }
  if (input.type === "press_key" && !input.key?.trim()) {
    throw new ValidationError("Key action requires a key");
  }
  if (input.durationMs !== undefined &&
      (!Number.isFinite(input.durationMs) || input.durationMs < 0)) {
    throw new ValidationError("durationMs must be a non-negative number");
  }
}

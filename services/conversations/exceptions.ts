export class ConversationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
export class ValidationError extends ConversationError {}
export class NotFoundError extends ConversationError {}
export class InvalidStateError extends ConversationError {}
export class AlreadyExistsError extends ConversationError {}
export class PermissionError extends ConversationError {}

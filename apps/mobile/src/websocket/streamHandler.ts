export interface StreamChunk {
  type: "text" | "error" | "done";
  content?: string;
}

export type StreamHandlerCallback =
  (chunk: StreamChunk) => void;

export class StreamHandler {
  private buffer = "";

  private callback:
    | StreamHandlerCallback
    | null = null;

  public setCallback(
    callback: StreamHandlerCallback
  ): void {
    this.callback = callback;
  }

  public handleChunk(
    chunk: string
  ): void {
    if (!chunk) {
      return;
    }

    this.buffer += chunk;

    this.callback?.({
      type: "text",
      content: chunk,
    });
  }

  public handleError(
    error: string
  ): void {
    this.callback?.({
      type: "error",
      content: error,
    });
  }

  public handleDone(): void {
    this.callback?.({
      type: "done",
      content: this.buffer,
    });
  }

  public getBuffer(): string {
    return this.buffer;
  }

  public clear(): void {
    this.buffer = "";
  }
}

const streamHandler =
  new StreamHandler();

export default streamHandler;
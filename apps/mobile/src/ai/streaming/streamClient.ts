export interface StreamChunk {
  id: string;
  content: string;
  done: boolean;
}

export type StreamCallback = (
  chunk: StreamChunk
) => void;

export class StreamClient {
  private connected = false;

  public connect(): void {
    this.connected = true;
  }

  public disconnect(): void {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async stream(
    content: string,
    onChunk: StreamCallback
  ): Promise<void> {
    if (!this.connected) {
      throw new Error("StreamClient is not connected.");
    }

    const words = content.split(" ");

    const streamId = this.generateId();

    for (let i = 0; i < words.length; i++) {
      onChunk({
        id: streamId,
        content: words[i] + (i < words.length - 1 ? " " : ""),
        done: false,
      });

      await this.delay(20);
    }

    onChunk({
      id: streamId,
      content: "",
      done: true,
    });
  }

  public async streamText(
    content: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.connected) {
      throw new Error("StreamClient is not connected.");
    }

    const words = content.split(" ");

    for (const word of words) {
      onChunk(word + " ");

      await this.delay(20);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const streamClient = new StreamClient();

streamClient.connect();

export default streamClient;
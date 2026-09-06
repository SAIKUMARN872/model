export interface SocketMessage {
  type: string;
  data?: unknown;
}

export type SocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export class SocketClient {
  private socket: WebSocket | null = null;

  private status: SocketStatus =
    "disconnected";

  private messageHandler:
    | ((message: SocketMessage) => void)
    | null = null;

  private statusHandler:
    | ((status: SocketStatus) => void)
    | null = null;

  public connect(url: string): void {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    if (this.socket) {
      return;
    }

    this.updateStatus("connecting");

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.updateStatus("connected");
      };

      this.socket.onmessage = (
        event
      ) => {
        try {
          const message =
            JSON.parse(event.data);

          this.messageHandler?.(
            message
          );
        } catch {
          this.messageHandler?.({
            type: "message",
            data: event.data,
          });
        }
      };

      this.socket.onerror = () => {
        this.updateStatus("error");
      };

      this.socket.onclose = () => {
        this.socket = null;

        this.updateStatus(
          "disconnected"
        );
      };
    } catch {
      this.socket = null;

      this.updateStatus("error");
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.updateStatus(
      "disconnected"
    );
  }

  public send(
    message: SocketMessage
  ): boolean {
    if (
      !this.socket ||
      this.socket.readyState !==
        WebSocket.OPEN
    ) {
      return false;
    }

    this.socket.send(
      JSON.stringify(message)
    );

    return true;
  }

  public onMessage(
    handler: (
      message: SocketMessage
    ) => void
  ): void {
    this.messageHandler = handler;
  }

  public onStatusChange(
    handler: (
      status: SocketStatus
    ) => void
  ): void {
    this.statusHandler = handler;
  }

  public getStatus(): SocketStatus {
    return this.status;
  }

  public isConnected(): boolean {
    return (
      this.status === "connected"
    );
  }

  private updateStatus(
    status: SocketStatus
  ): void {
    this.status = status;

    this.statusHandler?.(status);
  }
}

const socketClient =
  new SocketClient();

export default socketClient;
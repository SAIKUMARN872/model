export interface WebSocketMessage {
  type: string;
  data?: unknown;
}

export interface WebSocketClient {
  id: string;
  socket: WebSocket;
}

export class WebSocketManager {
  private clients: Map<
    string,
    WebSocketClient
  > = new Map();

  public addClient(
    id: string,
    socket: WebSocket
  ): void {
    this.clients.set(id, {
      id,
      socket,
    });
  }

  public removeClient(
    id: string
  ): void {
    this.clients.delete(id);
  }

  public getClient(
    id: string
  ): WebSocketClient | undefined {
    return this.clients.get(id);
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public broadcast(
    message: WebSocketMessage
  ): void {
    const data = JSON.stringify(message);

    this.clients.forEach(
      (client) => {
        if (
          client.socket.readyState ===
          WebSocket.OPEN
        ) {
          client.socket.send(data);
        }
      }
    );
  }

  public sendToClient(
    id: string,
    message: WebSocketMessage
  ): boolean {
    const client =
      this.clients.get(id);

    if (
      !client ||
      client.socket.readyState !==
        WebSocket.OPEN
    ) {
      return false;
    }

    client.socket.send(
      JSON.stringify(message)
    );

    return true;
  }

  public clear(): void {
    this.clients.clear();
  }
}

const webSocketManager =
  new WebSocketManager();

export default webSocketManager;
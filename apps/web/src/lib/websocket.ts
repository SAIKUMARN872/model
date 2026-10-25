class WebSocketService {
  private socket: WebSocket | null = null;

  connect(url: string) {
    if (typeof window === "undefined") return;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  send(data: unknown) {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      this.socket.send(JSON.stringify(data));
    }
  }

  close() {
    this.socket?.close();
  }

  getSocket() {
    return this.socket;
  }
}

const websocket = new WebSocketService();

export default websocket;
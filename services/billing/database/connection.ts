export class BillingDatabaseConnection {
    private connected = false;

    connect(): void {
        this.connected = true;
    }

    disconnect(): void {
        this.connected = false;
    }

    isConnected(): boolean {
        return this.connected;
    }

    async transaction<T>(
        callback: () => Promise<T> | T
    ): Promise<T> {
        if (!this.connected) {
            this.connect();
        }

        return callback();
    }
}

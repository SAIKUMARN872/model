export interface DatabaseConnection {
    connected: boolean
    connect(): Promise<void>
    disconnect(): Promise<void>
}

export class InMemoryDatabaseConnection implements DatabaseConnection {
    connected = false

    async connect(): Promise<void> {
        this.connected = true
    }

    async disconnect(): Promise<void> {
        this.connected = false
    }
}

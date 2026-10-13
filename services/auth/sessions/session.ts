export interface Session {
    id: string
    userId: string
    token: string
    createdAt: Date
    expiresAt: Date
    lastAccessedAt: Date
    revoked: boolean
    metadata: Record<string, string>
}

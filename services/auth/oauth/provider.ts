export interface OAuthProfile {
    provider: string
    providerId: string
    email: string
    name?: string
    avatarUrl?: string
}

export interface OAuthProvider {
    readonly name: string
    getAuthorizationUrl(state: string): string
    exchangeCode(code: string): Promise<OAuthProfile>
}

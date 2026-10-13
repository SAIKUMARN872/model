import type { OAuthProvider, OAuthProfile } from "./provider.js"

export class GoogleOAuthProvider implements OAuthProvider {
    readonly name = "google"

    constructor(
        private readonly clientId: string,
        private readonly redirectUri: string
    ) {}

    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: "code",
            scope: "openid email profile",
            state
        })

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    }

    async exchangeCode(code: string): Promise<OAuthProfile> {
        if (!code) {
            throw new Error("OAuth code is required")
        }

        throw new Error("Google OAuth token exchange requires an external OAuth client")
    }
}

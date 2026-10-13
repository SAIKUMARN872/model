import type { OAuthProvider, OAuthProfile } from "./provider.js"

export class GithubOAuthProvider implements OAuthProvider {
    readonly name = "github"

    constructor(
        private readonly clientId: string,
        private readonly redirectUri: string
    ) {}

    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: "read:user user:email",
            state
        })

        return `https://github.com/login/oauth/authorize?${params.toString()}`
    }

    async exchangeCode(code: string): Promise<OAuthProfile> {
        if (!code) {
            throw new Error("OAuth code is required")
        }

        throw new Error("GitHub OAuth token exchange requires an external OAuth client")
    }
}

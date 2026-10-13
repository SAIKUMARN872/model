import type { OAuthProvider, OAuthProfile } from "./provider.js"

export class OAuthManager {
    private readonly providers = new Map<string, OAuthProvider>()

    register(provider: OAuthProvider): void {
        this.providers.set(provider.name, provider)
    }

    getProvider(name: string): OAuthProvider | undefined {
        return this.providers.get(name)
    }

    authorizationUrl(provider: string, state: string): string {
        const implementation = this.providers.get(provider)

        if (!implementation) {
            throw new Error(`OAuth provider not configured: ${provider}`)
        }

        return implementation.getAuthorizationUrl(state)
    }

    async authenticate(provider: string, code: string): Promise<OAuthProfile> {
        const implementation = this.providers.get(provider)

        if (!implementation) {
            throw new Error(`OAuth provider not configured: ${provider}`)
        }

        return implementation.exchangeCode(code)
    }
}

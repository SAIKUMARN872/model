import type { AuthService } from "../services/auth-service.js"

export class LogoutController {
    constructor(private readonly auth: AuthService) {}

    logout(sessionId: string, userId?: string): { success: boolean } {
        return {
            success: this.auth.logout(sessionId, userId)
        }
    }
}

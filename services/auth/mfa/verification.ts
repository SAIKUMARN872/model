import type { MfaManager } from "./mfa.js"

export class MfaVerification {
    constructor(private readonly manager: MfaManager) {}

    verify(userId: string, code: string): boolean {
        if (!/^\d{6}$/.test(code)) {
            return false
        }

        return this.manager.verify(userId, code)
    }
}

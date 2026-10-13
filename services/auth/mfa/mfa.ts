import { randomBytes } from "node:crypto"
import { Totp } from "./totp.js"

export interface MfaSecret {
    userId: string
    secret: string
    createdAt: Date
}

export class MfaManager {
    private readonly secrets = new Map<string, MfaSecret>()

    constructor(private readonly totp = new Totp()) {}

    enroll(userId: string): MfaSecret {
        const record: MfaSecret = {
            userId,
            secret: randomBytes(20).toString("base64"),
            createdAt: new Date()
        }

        this.secrets.set(userId, record)
        return record
    }

    verify(userId: string, code: string): boolean {
        const record = this.secrets.get(userId)

        return record ? this.totp.verify(record.secret, code) : false
    }

    remove(userId: string): boolean {
        return this.secrets.delete(userId)
    }

    get(userId: string): MfaSecret | undefined {
        return this.secrets.get(userId)
    }
}

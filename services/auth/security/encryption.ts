import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

export class EncryptionService {
    private readonly key: Buffer

    constructor(secret: string) {
        this.key = createHash("sha256").update(secret).digest()
    }

    encrypt(value: string): string {
        const iv = randomBytes(12)
        const cipher = createCipheriv("aes-256-gcm", this.key, iv)

        const encrypted = Buffer.concat([
            cipher.update(value, "utf8"),
            cipher.final()
        ])

        const tag = cipher.getAuthTag()

        return [
            iv.toString("base64url"),
            tag.toString("base64url"),
            encrypted.toString("base64url")
        ].join(".")
    }

    decrypt(value: string): string {
        const parts = value.split(".")

        if (parts.length !== 3) {
            throw new Error("Invalid encrypted value")
        }

        const iv = Buffer.from(parts[0], "base64url")
        const tag = Buffer.from(parts[1], "base64url")
        const encrypted = Buffer.from(parts[2], "base64url")

        const decipher = createDecipheriv("aes-256-gcm", this.key, iv)
        decipher.setAuthTag(tag)

        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]).toString("utf8")
    }
}

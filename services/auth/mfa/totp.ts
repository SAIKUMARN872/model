import { createHmac } from "node:crypto"

export class Totp {
    constructor(
        private readonly digits = 6,
        private readonly periodSeconds = 30
    ) {}

    generate(secret: string, timestamp = Date.now()): string {
        const counter = Math.floor(timestamp / 1000 / this.periodSeconds)

        const buffer = Buffer.alloc(8)
        buffer.writeBigInt64BE(BigInt(counter))

        const digest = createHmac("sha1", Buffer.from(secret, "base64"))
            .update(buffer)
            .digest()

        const offset = digest[digest.length - 1] & 0x0f
        const code =
            ((digest[offset] & 0x7f) << 24) |
            ((digest[offset + 1] & 0xff) << 16) |
            ((digest[offset + 2] & 0xff) << 8) |
            (digest[offset + 3] & 0xff)

        return String(code % (10 ** this.digits)).padStart(this.digits, "0")
    }

    verify(secret: string, code: string, timestamp = Date.now(), window = 1): boolean {
        for (let offset = -window; offset <= window; offset++) {
            const adjusted = timestamp + offset * this.periodSeconds * 1000

            if (this.generate(secret, adjusted) === code) {
                return true
            }
        }

        return false
    }
}

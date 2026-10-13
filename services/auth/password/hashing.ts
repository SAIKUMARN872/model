import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
    const digest = createHash("sha256")
        .update(`${salt}:${password}`)
        .digest("hex")

    return `${salt}:${digest}`
}

export function verifyPassword(password: string, encoded: string): boolean {
    const separator = encoded.indexOf(":")

    if (separator <= 0) {
        return false
    }

    const salt = encoded.slice(0, separator)
    const expected = encoded.slice(separator + 1)
    const actual = createHash("sha256")
        .update(`${salt}:${password}`)
        .digest("hex")

    const expectedBuffer = Buffer.from(expected, "utf8")
    const actualBuffer = Buffer.from(actual, "utf8")

    return expectedBuffer.length === actualBuffer.length &&
        timingSafeEqual(expectedBuffer, actualBuffer)
}

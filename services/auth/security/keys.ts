import { randomBytes } from "node:crypto"

export class KeyManager {
    private readonly keys = new Map<string, string>()

    generate(name: string, size = 32): string {
        const key = randomBytes(size).toString("base64url")
        this.keys.set(name, key)
        return key
    }

    set(name: string, value: string): void {
        this.keys.set(name, value)
    }

    get(name: string): string | undefined {
        return this.keys.get(name)
    }

    remove(name: string): boolean {
        return this.keys.delete(name)
    }
}

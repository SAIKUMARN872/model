export interface AuthSchema {
    email: string
    password: string
}

export function validateAuthSchema(input: unknown): input is AuthSchema {
    if (!input || typeof input !== "object") {
        return false
    }

    const value = input as Record<string, unknown>

    return typeof value.email === "string" &&
        typeof value.password === "string"
}

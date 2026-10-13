export interface LoginSchema {
    email: string
    password: string
    mfaCode?: string
}

export function validateLoginSchema(input: unknown): input is LoginSchema {
    if (!input || typeof input !== "object") {
        return false
    }

    const value = input as Record<string, unknown>

    return typeof value.email === "string" &&
        typeof value.password === "string" &&
        (value.mfaCode === undefined || typeof value.mfaCode === "string")
}

export interface SecurityHeaders {
    "x-content-type-options": string
    "x-frame-options": string
    "referrer-policy": string
    "content-security-policy": string
}

export function securityHeaders(): SecurityHeaders {
    return {
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "no-referrer",
        "content-security-policy": "default-src 'self'"
    }
}

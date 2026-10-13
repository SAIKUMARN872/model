import type { Backend } from "./strategy.js";

export class BackendHealthChecker {
    async check(backend: Backend): Promise<boolean> {
        if (!backend.url) {
            return false;
        }

        return backend.healthy !== false;
    }

    async checkAll(backends: Backend[]): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>();

        for (const backend of backends) {
            results.set(
                backend.id,
                await this.check(backend)
            );
        }

        return results;
    }
}

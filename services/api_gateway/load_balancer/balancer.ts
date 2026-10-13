import {
    Backend,
    LoadBalancerStrategy,
    RoundRobinStrategy
} from "./strategy.js";

export class LoadBalancer {
    private readonly backends: Backend[] = [];

    constructor(
        private readonly strategy: LoadBalancerStrategy = new RoundRobinStrategy()
    ) {}

    addBackend(backend: Backend): void {
        if (!backend.id) {
            throw new Error("Backend id is required");
        }

        if (!backend.url) {
            throw new Error("Backend url is required");
        }

        const existing = this.backends.find(
            (item) => item.id === backend.id
        );

        if (existing) {
            throw new Error(`Backend already exists: ${backend.id}`);
        }

        this.backends.push({
            ...backend,
            healthy: backend.healthy ?? true
        });
    }

    removeBackend(id: string): boolean {
        const index = this.backends.findIndex(
            (backend) => backend.id === id
        );

        if (index === -1) {
            return false;
        }

        this.backends.splice(index, 1);
        return true;
    }

    getBackends(): Backend[] {
        return this.backends.map((backend) => ({
            ...backend
        }));
    }

    select(): Backend | undefined {
        return this.strategy.select(this.backends);
    }

    setHealth(id: string, healthy: boolean): void {
        const backend = this.backends.find(
            (item) => item.id === id
        );

        if (!backend) {
            throw new Error(`Backend not found: ${id}`);
        }

        backend.healthy = healthy;
    }
}

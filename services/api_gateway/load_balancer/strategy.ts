export interface Backend {
    id: string;
    url: string;
    weight?: number;
    healthy?: boolean;
}

export interface LoadBalancerStrategy {
    select(backends: Backend[]): Backend | undefined;
}

export class RoundRobinStrategy implements LoadBalancerStrategy {
    private index = 0;

    select(backends: Backend[]): Backend | undefined {
        const available = backends.filter(
            (backend) => backend.healthy !== false
        );

        if (available.length === 0) {
            return undefined;
        }

        const backend = available[this.index % available.length];
        this.index = (this.index + 1) % available.length;

        return backend;
    }
}

export class WeightedStrategy implements LoadBalancerStrategy {
    select(backends: Backend[]): Backend | undefined {
        const available = backends.filter(
            (backend) => backend.healthy !== false
        );

        if (available.length === 0) {
            return undefined;
        }

        const weighted: Backend[] = [];

        for (const backend of available) {
            const weight = Math.max(1, backend.weight ?? 1);

            for (let i = 0; i < weight; i += 1) {
                weighted.push(backend);
            }
        }

        return weighted[0];
    }
}

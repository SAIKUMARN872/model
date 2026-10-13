import {
    Backend,
    LoadBalancer,
    RoundRobinStrategy
} from "../load_balancer/index.js";

export class RoutingLoadBalancer {
    private readonly balancers = new Map<string, LoadBalancer>();

    register(
        service: string,
        backend: Backend
    ): void {
        let balancer = this.balancers.get(service);

        if (!balancer) {
            balancer = new LoadBalancer(
                new RoundRobinStrategy()
            );

            this.balancers.set(service, balancer);
        }

        balancer.addBackend(backend);
    }

    route(service: string): Backend | undefined {
        return this.balancers.get(service)?.select();
    }

    remove(service: string): void {
        this.balancers.delete(service);
    }
}

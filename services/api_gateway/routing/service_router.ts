import type {
  Route,
} from "../routes/router.js";

export class ServiceRouter {
  private readonly routes: Route[] = [];

  register(route: Route): void {
    this.routes.push({ ...route });
  }

  resolve(
    method: string,
    path: string,
  ): Route | undefined {
    return this.routes.find(
      (route) =>
        route.method.toUpperCase() ===
          method.toUpperCase() &&
        route.path === path,
    );
  }

  list(): Route[] {
    return this.routes.map((route) => ({
      ...route,
    }));
  }
}

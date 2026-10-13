export interface Route {
  method: string;
  path: string;
  service: string;
  handler?: string;
}

export class Router {
  private readonly routes: Route[] = [];

  add(route: Route): void {
    if (
      !route.method.trim() ||
      !route.path.trim() ||
      !route.service.trim()
    ) {
      throw new Error("Route fields are required");
    }

    const exists = this.routes.some(
      (item) =>
        item.method === route.method &&
        item.path === route.path,
    );

    if (exists) {
      throw new Error("Route already exists");
    }

    this.routes.push({ ...route });
  }

  match(
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

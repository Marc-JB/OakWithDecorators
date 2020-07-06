import { Router } from "https://deno.land/x/oak@v4.0.0/mod.ts";

interface Route {
  method?: string;
  path?: string;
}

interface EndpointInt {
  routes?: Map<string, Route>;
  path?: string;
}

type ConstructorType<R = {}> = new (...args: any[]) => R;

type Class = { [key: string]: (...args: any[]) => void | Promise<void> };

type ClassConstructor = ConstructorType<Class>;

type Endpoint = EndpointInt & ClassConstructor;

function getEndpoint(constructor: Function): Endpoint {
  return constructor as unknown as Endpoint;
}

function addRouteMethodToEndpoint(
  id: string,
  method: string,
  endpoint: Endpoint,
): void {
  const routes = endpoint.routes ?? new Map<string, Route>();

  const route = routes.get(id) ?? {};
  route.method = method;
  routes.set(id, route);

  endpoint.routes = routes;
}

function addRoutePathToEndpoint(
  id: string,
  path: string,
  endpoint: Endpoint,
): void {
  const routes = endpoint.routes ?? new Map<string, Route>();

  const route = routes.get(id) ?? {};
  route.path = path;
  routes.set(id, route);

  endpoint.routes = routes;
}

const HttpMethod: (name: string) => MethodDecorator = (name) =>
  (target, propertyKey, _): void => {
    const key = typeof propertyKey === "string"
      ? propertyKey
      : propertyKey.toString();
    addRouteMethodToEndpoint(
      key,
      name.toUpperCase(),
      getEndpoint(target.constructor),
    );
  };

export const HttpGet: MethodDecorator = HttpMethod("GET");
export const GET: MethodDecorator = HttpMethod("GET");

export const HttpPost: MethodDecorator = HttpMethod("POST");
export const POST: MethodDecorator = HttpMethod("POST");

export const HttpPut: MethodDecorator = HttpMethod("PUT");
export const PUT: MethodDecorator = HttpMethod("PUT");

export const HttpPatch: MethodDecorator = HttpMethod("PATCH");
export const PATCH: MethodDecorator = HttpMethod("PATCH");

export const HttpDelete: MethodDecorator = HttpMethod("DELETE");
export const DELETE: MethodDecorator = HttpMethod("DELETE");

export const HttpOptions: MethodDecorator = HttpMethod("OPTIONS");
export const OPTIONS: MethodDecorator = HttpMethod("OPTIONS");

export const HttpHead: MethodDecorator = HttpMethod("HEAD");
export const HEAD: MethodDecorator = HttpMethod("HEAD");

export const HttpAll: MethodDecorator = HttpMethod("*");

export const Path: (name: string) => MethodDecorator = (name) =>
  (target, propertyKey, _): void => {
    const key = typeof propertyKey === "string"
      ? propertyKey
      : propertyKey.toString();
    addRoutePathToEndpoint(key, name, getEndpoint(target.constructor));
  };

export const Endpoint: (name: string) => ClassDecorator = (name) =>
  (constructor): void => {
    getEndpoint(constructor).path = name;
  };

export const ApiController: (name: string) => ClassDecorator = Endpoint;

function addRoutesToRouter(
  router: Router,
  routes: Map<string, Route>,
  instance: any,
): Router {
  for (const [id, { path = "/", method = "*" }] of routes) {
    const func = (...args: any[]): any => instance[id](...args);
    switch (method) {
      case "GET": {
        router.get(path, func);
        break;
      }
      case "POST": {
        router.post(path, func);
        break;
      }
      case "PUT": {
        router.put(path, func);
        break;
      }
      case "PATCH": {
        router.patch(path, func);
        break;
      }
      case "DELETE": {
        router.delete(path, func);
        break;
      }
      case "OPTIONS": {
        router.options(path, func);
        break;
      }
      case "HEAD": {
        router.head(path, func);
        break;
      }
      case "*": {
        router.all(path, func);
        break;
      }
      default: {
        throw new Error(`${id} | ${path}: Method ${method} not supported`);
      }
    }
  }

  return router;
}

export const createRouter = <T>(
  target: ConstructorType<T>,
  instance: T,
): Router => {
  const endpoint = getEndpoint(target);
  const path = endpoint.path ?? "/";
  const router = new Router({
    prefix: path.startsWith("/") ? path : "/" + path,
  });
  const routes = endpoint.routes ?? new Map<string, Route>();

  return addRoutesToRouter(router, routes, instance);
};

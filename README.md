[![license](https://badgen.net/github/license/Marc-JB/OakWithDecorators?color=cyan)](https://github.com/Marc-JB/OakWithDecorators/blob/main/LICENSE)
# [WIP] Oak with decorators
Experimental library for using Oak with decorators

## Notes
* You will have to add `// @ts-expect-error` every time you use decorators in Deno :(

## Decorators
decorator | type | required | aliases | description
--- | --- | --- | --- | ---
@HttpGet | method | yes | @GET | Listen for HTTP GET requests
@HttpPost | method | yes | @POST | Listen for HTTP POST requests
@HttpPut | method | yes | @PUT | Listen for HTTP PUT requests
@HttpPatch | method | yes | @PATCH | Listen for HTTP PATCH requests
@HttpDelete | method | yes | @DELETE | Listen for HTTP DELETE requests
@HttpOptions | method | yes | @OPTIONS | Listen for HTTP OPTIONS requests
@HttpHead | method | yes | @HEAD | Listen for HTTP HEAD requests
@HttpAll | method | only if @Path is not set |  | Listen for all HTTP requests
@Path(path: string) | method | no (default path is `/`) |  | Attaches the method to the specified path
@Endpoint(path: string) | class | no (default path is `/`) | @ApiController(path: string) | Adds a prefix to all paths in this method

## Demo
```TypeScript
import { HttpGet, Path, Endpoint, createRouter } from "./mod.ts";
import {
  Application,
  Router,
  RouterContext,
} from "https://deno.land/x/oak@v4.0.0/mod.ts";

interface Pet {
  id: number;
  name: string;
  kind: string;
}

@Endpoint("pets")
// @ts-expect-error
class PetsController {
  public constructor(private readonly petsList: Pet[]) {}

  @HttpGet
  // @ts-expect-error
  public getAllPets({ response }: RouterContext): void {
    response.status = 200;
    response.body = JSON.stringify(this.petsList, undefined, 4);
  }

  @HttpGet
  @Path("/:id")
  // @ts-expect-error
  public getPetById({ params, response }: RouterContext): void {
    const pet =
      this.petsList.find((it) => it.id == parseInt(params.id ?? "0")) ?? null;
    response.status = pet === null ? 404 : 200;
    if (pet !== null) response.body = JSON.stringify(pet, undefined, 4);
  }
}

const myPets: Pet[] = [{ id: 1, name: "Maya", kind: "Macaw" }];

const petsRouter: Router = createRouter(
  PetsController,
  new PetsController(myPets),
);

const app = new Application();
app.use(petsRouter.routes());
app.use(petsRouter.allowedMethods());
await app.listen({ port: 8080 });
```

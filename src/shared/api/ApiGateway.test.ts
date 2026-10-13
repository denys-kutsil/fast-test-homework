import { ApiGateway } from "./ApiGateway";
import { HttpError } from "./HttpError";

interface RecordedCall {
  url: string;
  init?: RequestInit;
}

const responseOf = (status: number, body: unknown): Response =>
  (({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as unknown) as Response);

const gatewayWith = (response: Response) => {
  const calls: RecordedCall[] = [];
  const gateway = new ApiGateway("https://api.test/v1", async (url, init) => {
    calls.push({ url, init });
    return response;
  });
  return { calls, gateway };
};

describe("ApiGateway", () => {
  it("prefixes the path with the base url", async () => {
    const { calls, gateway } = gatewayWith(responseOf(200, []));

    await gateway.get("/books/me/");

    expect(calls[0].url).toBe("https://api.test/v1/books/me/");
  });

  it("returns the parsed response body", async () => {
    const { gateway } = gatewayWith(responseOf(200, [{ name: "I, Robot" }]));

    const books = await gateway.get<Array<{ name: string }>>("/books/me/");

    expect(books).toEqual([{ name: "I, Robot" }]);
  });

  it("sends the payload as json on post", async () => {
    const { calls, gateway } = gatewayWith(responseOf(200, { status: "ok" }));

    await gateway.post("/books/me/", { name: "Dune", author: "Herbert" });

    const init = calls[0].init as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(init.body).toBe('{"name":"Dune","author":"Herbert"}');
  });

  it("throws an HttpError carrying the status when the response is not ok", async () => {
    const { gateway } = gatewayWith(responseOf(500, {}));

    await expect(gateway.get("/books/me/")).rejects.toBeInstanceOf(HttpError);
  });

  it("exposes the status without reading the body of a failed response", async () => {
    const unreadableBody = (({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error("body of a failed response must not be read");
      }
    } as unknown) as Response);
    const { gateway } = gatewayWith(unreadableBody);

    const error = await gateway.get<never>("/books/me/").catch((e: HttpError) => e);

    expect(error.status).toBe(503);
  });

  it("forwards the abort signal to fetch", async () => {
    const { calls, gateway } = gatewayWith(responseOf(200, []));
    const signal = {} as AbortSignal;

    await gateway.get("/books/me/", { signal });

    expect((calls[0].init as RequestInit).signal).toBe(signal);
  });
});

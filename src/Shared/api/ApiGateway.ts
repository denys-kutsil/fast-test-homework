import { API_BASE } from "./config";
import { HttpError } from "./HttpError";
import { HttpGateway, RequestOptions } from "./HttpGateway";

type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export class ApiGateway implements HttpGateway {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchFn;

  constructor(baseUrl: string = API_BASE, fetchFn?: FetchFn) {
    this.baseUrl = baseUrl;
    this.fetchFn = fetchFn || ((input, init) => fetch(input, init));
  }

  get = <T>(path: string, options: RequestOptions = {}): Promise<T> =>
    this.request<T>(path, { method: "GET", signal: options.signal });

  post = <T>(path: string, payload: unknown, options: RequestOptions = {}): Promise<T> =>
    this.request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: options.signal
    });

  private request = async <T>(path: string, init: RequestInit): Promise<T> => {
    const response = await this.fetchFn(`${this.baseUrl}${path}`, init);

    if (!response.ok) {
      throw new HttpError(response.status, path);
    }

    return (await response.json()) as T;
  };
}

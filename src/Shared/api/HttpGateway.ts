export interface RequestOptions {
  signal?: AbortSignal;
}

export interface HttpGateway {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, payload: unknown, options?: RequestOptions): Promise<T>;
}

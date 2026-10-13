import { RequestOptions } from "shared/api/HttpGateway";

/**
 * Keeps one in-flight request per owner. Starting a new one cancels the
 * previous, and settle() reports whether the result still belongs to the
 * latest request, so a cancelled or superseded response never writes state.
 */
export class RequestScope {
  private pending: AbortController | null = null;

  start(): RequestOptions {
    this.abort();
    this.pending = new AbortController();
    return { signal: this.pending.signal };
  }

  settle(options: RequestOptions): boolean {
    const isCurrent = this.pending !== null && this.pending.signal === options.signal;

    if (isCurrent) {
      this.pending = null;
    }

    return isCurrent;
  }

  abort(): void {
    if (this.pending !== null) {
      this.pending.abort();
      this.pending = null;
    }
  }
}

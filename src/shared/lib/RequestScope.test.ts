import { RequestScope } from "./RequestScope";

describe("RequestScope", () => {
  it("hands out a signal that is not aborted yet", () => {
    const scope = new RequestScope();

    const options = scope.start();

    expect(options.signal!.aborted).toBe(false);
  });

  it("accepts the result of the only request in flight", () => {
    const scope = new RequestScope();

    const options = scope.start();

    expect(scope.settle(options)).toBe(true);
  });

  it("aborts the previous request when a new one starts", () => {
    const scope = new RequestScope();

    const first = scope.start();
    scope.start();

    expect(first.signal!.aborted).toBe(true);
  });

  it("rejects the result of a superseded request", () => {
    const scope = new RequestScope();

    const first = scope.start();
    const second = scope.start();

    expect(scope.settle(first)).toBe(false);
    expect(scope.settle(second)).toBe(true);
  });

  it("rejects the result of a request cancelled by abort", () => {
    const scope = new RequestScope();

    const options = scope.start();
    scope.abort();

    expect(options.signal!.aborted).toBe(true);
    expect(scope.settle(options)).toBe(false);
  });

  it("only settles a request once", () => {
    const scope = new RequestScope();

    const options = scope.start();

    expect(scope.settle(options)).toBe(true);
    expect(scope.settle(options)).toBe(false);
  });

  it("does nothing when aborting with no request in flight", () => {
    const scope = new RequestScope();

    expect(() => scope.abort()).not.toThrow();
  });
});

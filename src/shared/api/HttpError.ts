export class HttpError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.path = path;

    // The build target downlevels classes to ES5, which breaks instanceof
    // for Error subclasses unless the prototype is restored by hand.
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

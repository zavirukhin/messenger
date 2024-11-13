interface RequestErrorOptions {
  statusCode: number;
  errorText: string;
}

export class RequestError extends Error {
  constructor(error: RequestErrorOptions) {
    super(error.errorText);
    Object.setPrototypeOf(this, RequestError.prototype);
  }
}
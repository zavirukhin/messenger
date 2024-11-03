interface RequestErrorOptions {
  statusCode: number;
  errorText: string;
}

export class RequestError extends Error {
  public statusCode: number;

  public errorText: string;

  constructor(error: RequestErrorOptions) {
    super(error.errorText);
    this.errorText = error.errorText;
    this.statusCode = error.statusCode;
  }
}
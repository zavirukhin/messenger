interface RequestErrorOptions {
  statusCode: number;
  errorCode: string;
  errorText: string;
}

export class RequestError extends Error {
  public statusCode: number;

  public errorText: string;

  public errorCode: string;

  constructor(error: RequestErrorOptions) {
    super(error.errorText);
    this.errorText = error.errorText;
    this.statusCode = error.statusCode;
    this.errorCode = error.errorCode;
  }
}

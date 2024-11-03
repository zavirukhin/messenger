import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class InvalidTokenException extends HttpException {
  constructor() {
    const message = 'Предоставленный токен недействителен.';
    const status = HttpStatus.FORBIDDEN;
    super(
      { message, errorCode: ErrorCode.INVALID_TOKEN, statusCode: status },
      status,
    );
  }
}

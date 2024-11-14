import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class InvalidCodeException extends HttpException {
  constructor() {
    const message = 'Предоставленный код недействителен.';
    const status = HttpStatus.FORBIDDEN;
    super(
      { message, errorCode: ErrorCode.INVALID_CODE, statusCode: status },
      status,
    );
  }
}

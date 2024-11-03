import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CodeExpiredException extends HttpException {
  constructor() {
    const message = 'Код истек.';
    const status = HttpStatus.UNAUTHORIZED;
    super(
      { message, errorCode: ErrorCode.CODE_EXPIRED, statusCode: status },
      status,
    );
  }
}

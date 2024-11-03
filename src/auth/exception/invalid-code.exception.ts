import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class InvalidCodeException extends HttpException {
  constructor() {
    const message = 'Предоставленный код недействителен.';
    const status = HttpStatus.UNAUTHORIZED;
    super({ message, errorCode: ErrorCode.INVALID_CODE }, status);
  }
}

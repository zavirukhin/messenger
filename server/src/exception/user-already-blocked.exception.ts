import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UserAlreadyBlockedException extends HttpException {
  constructor() {
    const message = 'Пользователь уже заблокирован.';
    const status = HttpStatus.CONFLICT;
    super(
      {
        message,
        errorCode: ErrorCode.USER_ALREADY_BLOCKED,
        statusCode: status,
      },
      status,
    );
  }
}

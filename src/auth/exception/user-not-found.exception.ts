import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UserNotFoundException extends HttpException {
  constructor() {
    const message = 'Пользователь не найден.';
    const status = HttpStatus.NOT_FOUND;
    super(
      { message, errorCode: ErrorCode.USER_NOT_FOUND, statusCode: status },
      status,
    );
  }
}

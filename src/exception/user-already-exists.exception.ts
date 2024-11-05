import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    const message = 'Пользователь с таким номером телефона уже существует.';
    const status = HttpStatus.CONFLICT;
    super(
      { message, errorCode: ErrorCode.USER_ALREADY_EXISTS, statusCode: status },
      status,
    );
  }
}

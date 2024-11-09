import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UserUpdateException extends HttpException {
  constructor() {
    const message = 'Ошибка при обновлении данных пользователя.';
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    super(
      { message, errorCode: ErrorCode.USER_UPDATE_ERROR, statusCode: status },
      status,
    );
  }
}

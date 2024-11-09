import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UserDeleteException extends HttpException {
  constructor() {
    const message = 'Ошибка при удалении данных пользователя.';
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    super(
      { message, errorCode: ErrorCode.USER_DELETE_ERROR, statusCode: status },
      status,
    );
  }
}

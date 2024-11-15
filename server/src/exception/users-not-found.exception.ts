import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UsersNotFoundException extends HttpException {
  constructor(userIds: number[]) {
    const message = 'Пользователи не найдены.';
    const status = HttpStatus.NOT_FOUND;
    super(
      {
        message,
        errorCode: ErrorCode.USERS_NOT_FOUND,
        missingUsers: userIds,
        statusCode: status,
      },
      status,
    );
  }
}

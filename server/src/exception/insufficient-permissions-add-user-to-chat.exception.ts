import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class InsufficientPermissionsAddUserToChatException extends HttpException {
  constructor() {
    const message = 'Недостаточно прав для добавления пользователя в чат.';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_ADD_USER_TO_CHAT,
        statusCode: status,
      },
      status,
    );
  }
}

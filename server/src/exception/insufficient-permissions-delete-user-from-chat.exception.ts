import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class InsufficientPermissionsDeleteUserFromChatException extends HttpException {
  constructor() {
    const message = 'Недостаточно прав для удаления пользователя из чата.';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_DELETE_USER_FROM_CHAT,
        statusCode: status,
      },
      status,
    );
  }
}

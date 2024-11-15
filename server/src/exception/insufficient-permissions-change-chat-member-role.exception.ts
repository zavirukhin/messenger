import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class InsufficientPermissionsChangeChatMemberRoleException extends HttpException {
  constructor() {
    const message = 'Недостаточно прав для изменения роли пользователя.';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_CHANGE_CHAT_MEMBER_ROLE,
        statusCode: status,
      },
      status,
    );
  }
}

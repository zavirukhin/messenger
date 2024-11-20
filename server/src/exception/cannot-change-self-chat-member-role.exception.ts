import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CannotChangeSelfChatMemberRoleException extends HttpException {
  constructor() {
    const message = 'Нельзя изменить роль пользователя в чате у самого себя.';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.CANNOT_CHANGE_SELF_CHAT_MEMBER_ROLE,
        statusCode: status,
      },
      status,
    );
  }
}

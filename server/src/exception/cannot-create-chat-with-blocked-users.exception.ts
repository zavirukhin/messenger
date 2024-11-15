import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CannotCreateChatWithBlockedUsers extends HttpException {
  constructor(userIds: number[]) {
    const message = 'Нельзя создать чат с заблокированными пользователями.';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.CANNOT_CREATE_CHAT_WITH_BLOCKED_USERS,
        blockedUsers: userIds,
        statusCode: status,
      },
      status,
    );
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CannotCreateChatByBlockedUsers extends HttpException {
  constructor(userIds: number[]) {
    const message = 'Нельзя создать чат с пользователями заблокировавших нас.';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.CANNOT_CREATE_CHAT_BY_BLOCKED_USERS,
        blockeByUsers: userIds,
        statusCode: status,
      },
      status,
    );
  }
}

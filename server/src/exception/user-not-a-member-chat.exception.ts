import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UserNotAMemberChatException extends HttpException {
  constructor() {
    const message = 'Пользователь не является членом чата.';
    const status = HttpStatus.NOT_FOUND;
    super(
      {
        message,
        errorCode: ErrorCode.USER_NOT_A_MEMBER_CHAT,
        statusCode: status,
      },
      status,
    );
  }
}

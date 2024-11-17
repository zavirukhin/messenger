import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class UserAlreadyInChatException extends HttpException {
  constructor() {
    const message = 'Пользователь уже участник чата.';
    const status = HttpStatus.CONFLICT;
    super(
      {
        message,
        errorCode: ErrorCode.USER_ALREADY_IN_CHAT,
        statusCode: status,
      },
      status,
    );
  }
}

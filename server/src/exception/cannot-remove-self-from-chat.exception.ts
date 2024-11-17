import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CannotRemoveSelfFromChatException extends HttpException {
  constructor() {
    const message = 'Нельзя удалить самого себя из чата.';
    const status = HttpStatus.CONFLICT;
    super(
      {
        message,
        errorCode: ErrorCode.CANNOT_REMOVE_SELF_FROM_CHAT,
        statusCode: status,
      },
      status,
    );
  }
}

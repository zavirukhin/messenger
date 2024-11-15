import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CannotAddSelfAsMemberChatException extends HttpException {
  constructor() {
    const message = 'Нельзя добавить в пользователей чатов самого себя';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.CANNOT_ADD_SELF_AS_MEMBER_CONTACT,
        statusCode: status,
      },
      status,
    );
  }
}

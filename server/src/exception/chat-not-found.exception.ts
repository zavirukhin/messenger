import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class ChatNotFoundException extends HttpException {
  constructor() {
    const message = 'Чат не найден.';
    const status = HttpStatus.NOT_FOUND;
    super(
      { message, errorCode: ErrorCode.CHAT_NOT_FOUND, statusCode: status },
      status,
    );
  }
}

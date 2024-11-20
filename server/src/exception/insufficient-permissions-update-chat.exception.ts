import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class InsufficientPermissionsUpdateChatException extends HttpException {
  constructor() {
    const message = 'Недостаточно прав для изменения данных чата.';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS_UPDATE_CHAT,
        statusCode: status,
      },
      status,
    );
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CannotBlockSelfException extends HttpException {
  constructor() {
    const message = 'Нельзя заблокировать самого себя';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.CANNOT_BLOCK_SELF,
        statusCode: status,
      },
      status,
    );
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class BlockNotFoundException extends HttpException {
  constructor() {
    const message = 'Запись о блокировке не найдена.';
    const status = HttpStatus.NOT_FOUND;
    super(
      {
        message,
        errorCode: ErrorCode.BLOCK_NOT_FOUND,
        statusCode: status,
      },
      status,
    );
  }
}

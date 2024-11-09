import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class NoChangesDetectedException extends HttpException {
  constructor() {
    const message = 'Не было обнаружено изменений для обновления.';
    const status = HttpStatus.NOT_MODIFIED;
    super(
      { message, errorCode: ErrorCode.NO_CHANGES_DETECTED, statusCode: status },
      status,
    );
  }
}
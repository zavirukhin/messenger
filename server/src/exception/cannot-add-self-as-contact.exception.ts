import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CannotAddSelfAsContactException extends HttpException {
  constructor() {
    const message = 'Нельзя добавить в контакты самого себя';
    const status = HttpStatus.FORBIDDEN;
    super(
      {
        message,
        errorCode: ErrorCode.CANNOT_ADD_SELF_AS_CONTACT,
        statusCode: status,
      },
      status,
    );
  }
}

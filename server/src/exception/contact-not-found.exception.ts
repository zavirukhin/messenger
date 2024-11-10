import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class ContactNotFoundException extends HttpException {
  constructor() {
    const message = 'Запись о контакте не найдена.';
    const status = HttpStatus.NOT_FOUND;
    super(
      {
        message,
        errorCode: ErrorCode.CONTACT_NOT_FOUND,
        statusCode: status,
      },
      status,
    );
  }
}

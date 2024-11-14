import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class ContactAlreadyExistsException extends HttpException {
  constructor() {
    const message = 'Контакт уже существует.';
    const status = HttpStatus.CONFLICT;
    super(
      {
        message,
        errorCode: ErrorCode.CONTACT_ALREADY_EXISTS,
        statusCode: status,
      },
      status,
    );
  }
}

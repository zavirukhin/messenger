import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CustomNameAlreadyExistsException extends HttpException {
  constructor() {
    const message = 'Пользователь с таким кастомным именем уже существует.';
    const status = HttpStatus.CONFLICT;
    super(
      {
        message,
        errorCode: ErrorCode.CUSTOM_NAME_ALREADY_EXISTS,
        statusCode: status,
      },
      status,
    );
  }
}

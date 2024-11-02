import { HttpException, HttpStatus } from '@nestjs/common';

export class CodeExpiredException extends HttpException {
  constructor() {
    super('Код авторизации истек', HttpStatus.GONE);
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCodeException extends HttpException {
  constructor() {
    super('Неверный код авторизации', HttpStatus.UNAUTHORIZED);
  }
}

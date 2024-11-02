import { HttpException, HttpStatus } from '@nestjs/common';

export class CodeCooldownException extends HttpException {
  constructor() {
    super('Код можно отправить только раз в 60 секунд', HttpStatus.TOO_MANY_REQUESTS);
  }
}
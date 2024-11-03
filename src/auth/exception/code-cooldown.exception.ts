import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class CodeCooldownException extends HttpException {
  constructor() {
    const message = 'Пожалуйста, подождите, прежде чем запрашивать новый код.';
    const status = HttpStatus.TOO_MANY_REQUESTS;
    super({ message, errorCode: ErrorCode.CODE_COOLDOWN }, status);
  }
}

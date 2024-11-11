import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export class TwilioException extends HttpException {
  constructor(errorDetails: string) {
    const message = `Ошибка Twilio: ${errorDetails}`;
    const status = HttpStatus.SERVICE_UNAVAILABLE;
    super(
      { message, errorCode: ErrorCode.TWILIO_ERROR, statusCode: status },
      status,
    );
  }
}

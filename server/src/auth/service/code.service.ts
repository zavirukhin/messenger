import { HttpStatus, Injectable } from '@nestjs/common';
import { CodeCooldownException } from '../../exception/code-cooldown.exception';
import { CodeExpiredException } from '../../exception/code-expired.exception';
import { InvalidCodeException } from '../../exception/invalid-code.exception';
import { generateCode } from '../utils/utils';
import { TwilioAdapter } from '../adapter/twilio.adapter';

@Injectable()
export class CodeService {
  private codes = new Map<
    string,
    { code: string; expiresAt: number; lastSentAt: number }
  >();
  private readonly cooldownPeriod = 60 * 1000; // 60 секунд для повторной отправки
  private readonly codeExpiry = 5 * 60 * 1000; // 5 минут для истечения кода
  private twilioAdapter: TwilioAdapter;

  constructor() {
    this.twilioAdapter = new TwilioAdapter(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_MESSAGING_SERVICE_ID,
    );
  }

  async sendCode(phone: string): Promise<{
    nextAttempt: number;
    message: string;
    statusCode: HttpStatus;
  }> {
    const now = Date.now();
    const storedData = this.codes.get(phone);

    if (storedData && now - storedData.lastSentAt < this.cooldownPeriod) {
      throw new CodeCooldownException();
    }

    const code = generateCode();
    const expiresAt = now + this.codeExpiry;
    this.codes.set(phone, { code, expiresAt, lastSentAt: now });

    if (process.env.TWILIO_IS_ACTIVE === 'true') {
      await this.twilioAdapter.sendSMS(phone, code);
    } else {
      console.log(`Отправлен код ${code} для телефона ${phone}`);
    }
    return {
      nextAttempt: this.cooldownPeriod,
      message: 'Код успешно отправлен',
      statusCode: HttpStatus.CREATED,
    };
  }

  validateCode(
    phone: string,
    code: string,
    deleteAfterValidation = true,
  ): void {
    const storedCodeData = this.codes.get(phone);

    if (!storedCodeData) {
      throw new CodeExpiredException();
    }

    if (Date.now() > storedCodeData.expiresAt) {
      this.codes.delete(phone);
      throw new CodeExpiredException();
    }

    if (storedCodeData.code !== code) {
      throw new InvalidCodeException();
    }

    if (deleteAfterValidation) {
      this.codes.delete(phone);
    }
  }

  deleteCode(phone: string): void {
    this.codes.delete(phone);
  }
}

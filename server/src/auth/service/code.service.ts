import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CodeCooldownException } from '../../exception/code-cooldown.exception';
import { CodeExpiredException } from '../../exception/code-expired.exception';
import { InvalidCodeException } from '../../exception/invalid-code.exception';
import { generateCode } from '../utils/utils';
import { TwilioAdapter } from '../adapter/twilio.adapter';

@Injectable()
export class CodeService {
  private readonly logger = new Logger(CodeService.name); // Инициализация логгера
  private codes = new Map<
    string,
    { code: string; expiresAt: number; lastSentAt: number }
  >();
  private readonly cooldownPeriod = 60 * 1000; // 60 секунд для повторной отправки
  private readonly codeExpiry = 5 * 60 * 1000; // 5 минут для истечения кода
  private readonly fallbackCode = process.env.FALLBACK_CODE || '111111'; // Код по умолчанию из env
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
      this.logger.warn(
        `Попытка отправки кода слишком рано для телефона: ${phone}`,
      );
      throw new CodeCooldownException();
    }

    const code = generateCode();
    const expiresAt = now + this.codeExpiry;
    this.codes.set(phone, { code, expiresAt, lastSentAt: now });

    this.logger.log(`Сгенерирован код ${code} для телефона: ${phone}`);

    if (process.env.TWILIO_IS_ACTIVE === 'true') {
      try {
        await this.twilioAdapter.sendSMS(phone, code);
        this.logger.log(`Успешно отправлен код ${code} на телефон: ${phone}`);
      } catch (error) {
        this.logger.error(
          `Ошибка при отправке SMS на ${phone}: ${error.message}`,
          error.stack,
        );
        this.codes.set(phone, {
          code: this.fallbackCode,
          expiresAt,
          lastSentAt: now,
        });
        this.logger.warn(
          `Использован код по умолчанию ${this.fallbackCode} для телефона: ${phone} из-за ошибки при отправке SMS.`,
        );
      }
    } else {
      this.logger.log(
        `Имитация отправки SMS с кодом ${code} для телефона: ${phone}`,
      );
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
      this.logger.warn(`Код для телефона ${phone} не найден или истек.`);
      throw new CodeExpiredException();
    }

    if (Date.now() > storedCodeData.expiresAt) {
      this.codes.delete(phone);
      this.logger.warn(`Код для телефона ${phone} истек.`);
      throw new CodeExpiredException();
    }

    if (storedCodeData.code !== code) {
      this.logger.warn(`Неверный код ${code} введен для телефона ${phone}.`);
      throw new InvalidCodeException();
    }

    if (deleteAfterValidation) {
      this.codes.delete(phone);
      this.logger.log(
        `Код для телефона ${phone} успешно подтвержден и удален.`,
      );
    }
  }

  deleteCode(phone: string): void {
    this.codes.delete(phone);
    this.logger.log(`Код для телефона ${phone} удален.`);
  }
}

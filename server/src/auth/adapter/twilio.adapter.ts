import { TwilioException } from '../../exception/twilio.exception';
import * as twilio from 'twilio';

export class TwilioAdapter {
  private client: twilio.Twilio;

  constructor(
    private accountSid: string,
    private authToken: string,
    private messagingServiceSid: string,
  ) {
    this.client = twilio(accountSid, authToken);
  }

  async sendSMS(to: string, code: string): Promise<void> {
    try {
      await this.client.verify.v2
        .services(this.messagingServiceSid)
        .verifications.create({
          channel: 'sms',
          customCode: code,
          to: to,
        });
    } catch (error) {
      throw new TwilioException(error.message);
    }
  }
}

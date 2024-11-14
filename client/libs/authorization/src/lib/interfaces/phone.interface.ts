import { NextAttempt } from './next-attempt.interface';

export interface PhoneVerify extends NextAttempt {
  phone: string;
}
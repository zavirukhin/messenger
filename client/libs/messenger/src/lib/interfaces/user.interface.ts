import { ProfileResponse } from './profile-response.interface';

export interface User extends ProfileResponse {
  isBlockedByUser: boolean;
}
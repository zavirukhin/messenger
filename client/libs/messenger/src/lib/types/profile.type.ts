import { ProfileResponse } from '../interfaces/profile-response.interface';

export type Profile = Pick<ProfileResponse, 'id' | 'firstName' | 'lastName' | 'customName' | 'avatar'>;
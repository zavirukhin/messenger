import { ProfileResponse } from '../interfaces/profile-response.interface';

export type Profile = Pick<ProfileResponse, 'first_name' | 'last_name' | 'custom_name' | 'avatar_base64'>;
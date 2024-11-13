import { ProfileResponse } from '../interfaces/profile-response.interface';

export type Profile = Pick<ProfileResponse, 'id' | 'first_name' | 'last_name' | 'custom_name' | 'avatar_base64'>;
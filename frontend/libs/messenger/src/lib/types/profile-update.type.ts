import { Profile } from '../interfaces/profile.interface';

export type ProfileUpdate = Partial<
  Pick<Profile, 'first_name' | 'last_name' | 'custom_name' | 'avatar_base64'>
>;
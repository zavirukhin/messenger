import { Profile } from './profile.type';

export type UpdateProfile = Omit<Profile, 'id' | 'avatar_base64'> & {
  avatar: File | null;
};
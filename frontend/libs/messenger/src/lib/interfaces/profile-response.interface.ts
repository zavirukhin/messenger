export interface ProfileResponse {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  last_activity: Date;
  avatar_base64: string | null;
  custom_name: string | null;
  created_at: Date;
  updated_at: Date;
}
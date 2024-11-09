export interface Profile {
  id: number;
  phone: string;
  first_name: string;
  last_name: string;
  last_activity: Date;
  avatar_base64: string;
  custom_name: string;
  created_at: Date;
  updated_at: Date;
}
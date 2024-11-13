export interface ProfileResponse {
  id: number;
  phone: string;
  firstName: string;
  lastName: string;
  lastActivity: Date;
  avatarBase64: string | null;
  customName: string | null;
  createdAt: Date;
  updatedAt: Date;
}
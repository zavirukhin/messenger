export interface ProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  lastActivity: Date;
  avatar: string | null;
  customName: string | null;
  createdAt: Date;
  updatedAt: Date;
}
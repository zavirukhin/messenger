export interface Members {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    lastActivity: string;
    avatar: string | null;
    customName: string;
  };
  chatRole: string;
}

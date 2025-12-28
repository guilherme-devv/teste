export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  identityStatus: "pending" | "submitted" | "approved" | "rejected";
  documentUrls?: string[];
  rejectionReason?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface Profile {
  accountId: string;
  displayName: string;
  avatar: string | null;
  timezone: string;
  preferences: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  avatar?: string | null;
  timezone?: string;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

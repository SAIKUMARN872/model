export interface UserActivity {
  userId: string;
  action: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

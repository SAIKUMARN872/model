export interface RateLimitRule {
  name: string;
  limit: number;
  windowMs: number;
}

export const defaultRateLimitRules: RateLimitRule[] = [
  {
    name: "default",
    limit: 100,
    windowMs: 60000,
  },
];

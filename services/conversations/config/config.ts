export interface ConversationConfig {
  maxMessages: number;
  maxShares: number;
  allowPublicShares: boolean;
}
export function loadConversationConfig(
  overrides: Partial<ConversationConfig> = {}
): ConversationConfig {
  return {
    maxMessages: overrides.maxMessages ?? 1000,
    maxShares: overrides.maxShares ?? 100,
    allowPublicShares: overrides.allowPublicShares ?? true
  };
}

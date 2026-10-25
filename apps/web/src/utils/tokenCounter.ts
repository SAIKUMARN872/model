export const estimateTokens = (text: string): number => {
  return Math.ceil(text.trim().split(/\s+/).length * 1.3);
};

export const estimateCost = (
  tokens: number,
  pricePer1K = 0.002
): number => {
  return (tokens / 1000) * pricePer1K;
};
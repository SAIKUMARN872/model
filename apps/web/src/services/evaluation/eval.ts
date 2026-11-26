export interface EvaluationResult {
  score: number;
  feedback: string;
}

export async function evaluateResponse(
  response: string
): Promise<EvaluationResult> {
  const score = Math.min(
    100,
    Math.max(60, response.length)
  );

  return {
    score,
    feedback: score > 80 ? "Excellent" : "Needs Improvement",
  };
}
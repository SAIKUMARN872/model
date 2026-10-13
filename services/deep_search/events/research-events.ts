export interface ResearchEvent {
  researchId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  at: Date;
}

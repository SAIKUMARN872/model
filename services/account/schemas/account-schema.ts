export type AccountStatus = "active" | "suspended" | "deleted";

export type AccountPlan =
  | "free"
  | "plus"
  | "pro"
  | "business"
  | "enterprise";

export interface Account {
  id: string;
  email: string;
  name: string;
  status: AccountStatus;
  plan: AccountPlan;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountInput {
  email: string;
  name: string;
  plan?: AccountPlan;
  credits?: number;
}

export interface UpdateAccountInput {
  email?: string;
  name?: string;
  status?: AccountStatus;
  plan?: AccountPlan;
  credits?: number;
}

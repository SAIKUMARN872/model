export type Plugin = {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  icon: string;
  authenticationType: "OAuth" | "API Key" | "Database";
  permissions: string[];
  installed: boolean;
};
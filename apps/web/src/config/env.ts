export const ENV = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "AI Workspace",

  APP_ENV:
    process.env.NEXT_PUBLIC_APP_ENV || "development",

  API_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000/api",

  SOCKET_URL:
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "ws://localhost:8000",

  ENABLE_DEBUG:
    process.env.NEXT_PUBLIC_DEBUG === "true",

  ENABLE_LOGS:
    process.env.NEXT_PUBLIC_LOGS !== "false",
};

export default ENV;
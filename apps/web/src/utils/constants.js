"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORAGE_KEYS = exports.AI_MODELS = exports.ROUTES = exports.API_BASE_URL = exports.APP_NAME = void 0;
exports.APP_NAME = "AI Platform";
exports.API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
exports.ROUTES = {
    HOME: "/",
    CHAT: "/chat",
    DASHBOARD: "/dashboard",
    MODELS: "/models",
    RESEARCH: "/research",
    SETTINGS: "/settings"
};
exports.AI_MODELS = [
    {
        id: "gpt",
        name: "GPT Model"
    },
    {
        id: "claude",
        name: "Claude Model"
    },
    {
        id: "llama",
        name: "Llama Model"
    }
];
exports.STORAGE_KEYS = {
    TOKEN: "token",
    USER: "user",
    CHAT: "chat_history"
};

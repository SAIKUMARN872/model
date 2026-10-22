import cors from "cors";
import type { RequestHandler } from "express";
import { settings } from "../config/settings.js";

export const corsMiddleware: RequestHandler = cors({
  origin(origin, callback) {
    if (!origin || settings.security.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
});

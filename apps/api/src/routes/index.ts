import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";
import { chatController } from "../controllers/chat.controller.js";
import { telemetryController } from "../controllers/telemetry.controller.js";
import { performanceController } from "../controllers/performance.controller.js";

const router = Router();

router.get("/health", healthController);
router.post("/chat", chatController);
router.get("/telemetry", telemetryController);
router.get("/performance", performanceController);

export default router;

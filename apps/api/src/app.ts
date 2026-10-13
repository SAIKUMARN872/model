import express from "express";
import cors from "cors";
import helmet from "helmet";
import apiRouter from "./routes/index.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => {
  res.json({
    service: "ModelNow API",
    version: "v1",
    status: "running",
  });
});

app.use("/api/v1", apiRouter);

export default app;

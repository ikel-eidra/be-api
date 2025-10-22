// calm, humane logging (no PII)
import express from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";

const app = express();

// ---- Logging ----
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: undefined,
});
app.use(pinoHttp({ logger }));

// ---- Security + CORS ----
app.use(
  helmet({
    contentSecurityPolicy: false, // keep simple for APIs
  })
);

app.use(
  cors({
    origin: "*", // TODO: tighten for prod (list exact origins)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---- Middleware ----
app.use(express.json());

// ---- Health & Utility Routes ----
app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));
app.get("/ping", (req, res) =>
  res.json({ pong: true, at: new Date().toISOString() })
);

// ---- Root route ----
app.get("/", (req, res) => {
  res.json({
    message: "be-api: calm + humane /",
    docs: ["/healthz", "/ping"],
  });
});

// ---- Error Handler ----
app.use((err, req, res, next) => {
  req.log.error({ err }, "unhandled_error");
  res.status(500).json({ error: "Something went wrong. We're on it." });
});

// ---- Start Server ----
const port = process.env.PORT || 8080;
app.listen(port, () => {
  logger.info({ port }, "API listening");
});

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';

const app = express();

// calm, humane logging (no PII)
const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: undefined });
app.use(pinoHttp({ logger }));

// secure headers + gentle CORS (adjust origins later)
app.use(helmet({
  contentSecurityPolicy: false, // keep simple for APIs
}));
app.use(cors({
  origin: '*', // TODO: tighten for prod (list exact origins)
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());

// health endpoints
app.get('/healthz', (req, res) => res.status(200).json({ ok: true }));
app.get('/ping', (req, res) => res.json({ pong: true, at: new Date().toISOString() }));

// calming default
app.get('/', (req, res) => {
  res.json({
    message: 'be-api: calm + humane ✔',
    docs: ['/healthz', '/ping']
  });
});

// basic error handler (no stack leak in prod)
app.use((err, req, res, next) => {
  req.log?.error({ err }, 'unhandled_error');
  res.status(500).json({ error: 'Something went wrong. We\'re on it.' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  logger.info({ port }, 'API listening');
});

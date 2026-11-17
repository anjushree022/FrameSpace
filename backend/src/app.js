import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrls }));
app.use(express.json({ limit: '2mb' }));
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000, standardHeaders: true, legacyHeaders: false })
);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;

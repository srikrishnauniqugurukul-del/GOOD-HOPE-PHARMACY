import express from 'express';
import serverless from 'serverless-http';
import { createApiRouter } from '../../server/api/routes.ts';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const apiRouter = createApiRouter();

// Health endpoints across possible Netlify rewrite prefixes
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'good-hope-pharmacy', runtime: 'netlify-functions' });
});
app.get('/.netlify/functions/api/healthz', (_req, res) => {
  res.json({ ok: true, service: 'good-hope-pharmacy', runtime: 'netlify-functions' });
});

// Mount API router on all Netlify redirect path forms
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);
app.use('/', apiRouter);

export const handler = serverless(app);

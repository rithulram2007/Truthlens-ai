import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let backend;
try {
  backend = require('../dist/server.cjs');
} catch (err) {
  const fallbackPath = path.join(process.cwd(), 'dist', 'server.cjs');
  backend = require(fallbackPath);
}

const expressApp = backend.default || backend.app || backend;

export default function handler(req, res) {
  // If Vercel rewrote the incoming request to /api/index.js, restore the original route path
  if (req.url && (req.url === '/api/index.js' || req.url.startsWith('/api/index.js?'))) {
    const originalUrl =
      req.headers['x-matched-path'] ||
      req.headers['x-forwarded-url'] ||
      req.headers['x-now-route-matches'];
    if (originalUrl && typeof originalUrl === 'string') {
      req.url = originalUrl;
    }
  }

  return expressApp(req, res);
}

export { expressApp as app };

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

const app = backend.default || backend.app || backend;

export { app };
export default app;

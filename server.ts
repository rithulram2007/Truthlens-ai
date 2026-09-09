import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { extractArticle } from './server/pipeline/articleExtractor';
import { extractClaimsFromText } from './server/pipeline/claimExtractor';
import { verifyClaimsPipeline } from './server/pipeline/verificationEngine';
import { isGeminiQuotaOrServiceError } from './server/gemini';

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'TruthLens Verification Engine',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Preview article / claim extraction
  app.post('/api/extract-input', async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== 'string') {
        res.status(400).json({ error: 'Input text or URL is required.' });
        return;
      }
      const extracted = await extractArticle(input);
      res.json(extracted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Error in /api/extract-input:', msg);
      res.status(500).json({ error: 'Failed to extract input data.', details: msg });
    }
  });

  // Main verification pipeline endpoint
  app.post('/api/verify', async (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== 'string' || !input.trim()) {
        res.status(400).json({ error: 'Please provide a factual claim, URL, or article text.' });
        return;
      }

      console.log(`[TruthLens] Initiating verification pipeline for input length: ${input.length}`);

      // 1. Article / Input Extraction
      const articleData = await extractArticle(input);

      // 2. Claim Decomposition & Classification
      const rawClaims = await extractClaimsFromText(articleData.text, articleData.inputType);
      console.log(`[TruthLens] Extracted ${rawClaims.length} claims.`);

      // 3. Evidence Retrieval, Assessment, Ranking, Comparison & Gemini Reasoning
      const result = await verifyClaimsPipeline(articleData, rawClaims);
      console.log(`[TruthLens] Verification completed. Overall verdict: ${result.overallVerdict}, confidence: ${result.overallConfidence}%`);

      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[TruthLens] Error in verification pipeline:', msg);

      if (isGeminiQuotaOrServiceError(err)) {
        res.status(429).json({
          error: 'Verification Service Unavailable',
          code: 'RESOURCE_EXHAUSTED',
          isQuotaError: true,
          message:
            'Verification Service Unavailable: The Gemini API quota is currently exhausted (HTTP 429 RESOURCE_EXHAUSTED).',
          details: msg,
        });
        return;
      }

      res.status(500).json({
        error: 'Verification processing encountered an error.',
        details: msg,
      });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthLens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

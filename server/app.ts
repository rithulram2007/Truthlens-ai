import express from 'express';
import { extractArticle } from './pipeline/articleExtractor';
import { extractClaimsFromText } from './pipeline/claimExtractor';
import { verifyClaimsPipeline } from './pipeline/verificationEngine';
import { isGeminiQuotaOrServiceError } from './gemini';
import { isTavilyQuotaOrServiceError } from './tavily';

export const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (supports /api/health, /health, and /api for Vercel functions and local dev)
app.get(['/api/health', '/health', '/api'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TruthLens Verification Engine',
    timestamp: new Date().toISOString(),
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasTavilyKey: Boolean(process.env.TAVILY_API_KEY),
  });
});

// Preview article / claim extraction
app.post(['/api/extract-input', '/extract-input'], async (req, res) => {
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
app.post(['/api/verify', '/verify'], async (req, res) => {
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

    if (isGeminiQuotaOrServiceError(err) || isTavilyQuotaOrServiceError(err) || (err as Record<string, unknown>)?.isQuotaError) {
      const errorObj = err as Record<string, unknown>;
      const defaultService = msg.toLowerCase().includes('tavily')
        ? 'Tavily'
        : process.env.OPENROUTER_API_KEY
        ? 'OpenRouter'
        : 'Gemini';
      const service = (errorObj?.service as string) || defaultService;
      const statusCode = typeof errorObj?.status === 'number' ? errorObj.status : 429;
      const errorCode = (errorObj?.code as string) || 'RESOURCE_EXHAUSTED';

      res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 429).json({
        error: 'Verification Service Unavailable',
        code: errorCode,
        isQuotaError: true,
        service,
        message: msg.startsWith('Verification Service Unavailable')
          ? msg
          : `Verification Service Unavailable: ${service} quota or service is currently unavailable.`,
        details: (errorObj?.details as string) || msg,
      });
      return;
    }

    res.status(500).json({
      error: 'Verification processing encountered an error.',
      details: msg,
    });
  }
});

export default app;

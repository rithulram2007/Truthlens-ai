import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Please configure it in your environment or AI Studio Secrets."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export function isGeminiQuotaOrServiceError(err: unknown): boolean {
  if (!err) return false;
  const anyErr = err as Record<string, unknown>;
  const status = anyErr.status || anyErr.statusCode || anyErr.code;
  if (status === 429 || status === 503) return true;
  const str = String(err instanceof Error ? `${err.name} ${err.message}` : err) + ' ' + JSON.stringify(anyErr);
  return (
    status === 429 ||
    status === 503 ||
    str.includes('429') ||
    str.includes('RESOURCE_EXHAUSTED') ||
    str.includes('exceeded your current quota') ||
    str.includes('quota') ||
    str.includes('UNAVAILABLE') ||
    str.includes('high demand') ||
    str.includes('Rate limit') ||
    str.includes('rate-limit') ||
    str.includes('Verification Service Unavailable')
  );
}

export function createServiceUnavailableError(
  originalMessage?: string,
  serviceProvider?: 'Tavily' | 'Gemini'
): Error {
  const isTavily = serviceProvider === 'Tavily' || originalMessage?.toLowerCase().includes('tavily');
  const is503 = originalMessage?.includes('503') || originalMessage?.includes('UNAVAILABLE') || originalMessage?.includes('high demand');
  const providerLabel = isTavily ? 'Tavily Search API' : 'Gemini reasoning model';

  const message = is503
    ? `Verification Service Unavailable: ${providerLabel} is currently experiencing temporary high demand (503 UNAVAILABLE). Please try again shortly.`
    : `Verification Service Unavailable: ${providerLabel} quota is currently exhausted (HTTP 429 RESOURCE_EXHAUSTED).`;

  const err = new Error(message);
  Object.assign(err, {
    status: is503 ? 503 : 429,
    code: is503 ? 'UNAVAILABLE' : 'RESOURCE_EXHAUSTED',
    isQuotaError: true,
    service: isTavily ? 'Tavily' : 'Gemini',
    details: originalMessage || '',
  });
  return err;
}

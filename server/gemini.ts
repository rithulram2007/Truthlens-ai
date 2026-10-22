import { GoogleGenAI } from "@google/genai";

// OpenRouter model identifier constant - easily configurable
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-3.8-flash';

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

/**
 * Executes an AI chat completion request using OpenRouter's OpenAI-compatible endpoint.
 * No automatic retry loop is used.
 */
export async function callOpenRouter(
  prompt: string,
  options?: { json?: boolean; max_tokens?: number }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw createServiceUnavailableError(
      'OPENROUTER_API_KEY is not configured on the server. Please provide a valid key.',
      'OpenRouter'
    );
  }

  // OpenRouter reserves max_tokens * token_price against user credits.
  // Defaulting to 2048 prevents HTTP 402 errors when the model defaults to 65536 tokens.
  const maxTokens = options?.max_tokens || 2048;

  const payload: Record<string, unknown> = {
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: maxTokens,
  };

  if (options?.json) {
    payload.response_format = { type: 'json_object' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  let res: Response;
  try {
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://truthlens.vercel.app',
        'X-Title': 'TruthLens Verification Engine',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (netErr: unknown) {
    clearTimeout(timeoutId);
    const msg = netErr instanceof Error ? netErr.message : String(netErr);
    console.error('[TruthLens] OpenRouter network/timeout error:', msg);
    const isTimeout = netErr instanceof Error && (netErr.name === 'AbortError' || msg.includes('abort'));
    const err = new Error(
      `Verification Service Unavailable: ${isTimeout ? 'Request timed out contacting OpenRouter' : 'Network error contacting OpenRouter'} (${msg}).`
    );
    Object.assign(err, {
      status: 503,
      code: 'UNAVAILABLE',
      isQuotaError: true,
      service: 'OpenRouter',
      details: msg,
    });
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    let errBody = '';
    try {
      errBody = await res.text();
    } catch {
      errBody = res.statusText;
    }
    console.error(`[TruthLens] OpenRouter returned HTTP ${res.status}:`, errBody);

    if (res.status === 401 || res.status === 403) {
      const err = new Error(
        `Verification Service Unavailable: OpenRouter API authentication failed (HTTP ${res.status}). Please check your OPENROUTER_API_KEY.`
      );
      Object.assign(err, {
        status: res.status,
        code: 'AUTHENTICATION_FAILED',
        isQuotaError: true,
        service: 'OpenRouter',
        details: errBody,
      });
      throw err;
    }

    if (res.status === 402) {
      const err = new Error(
        `Verification Service Unavailable: OpenRouter credits insufficient or token limit exceeded (HTTP 402 PAYMENT_REQUIRED). Please check credit balance.`
      );
      Object.assign(err, {
        status: 402,
        code: 'PAYMENT_REQUIRED',
        isQuotaError: true,
        service: 'OpenRouter',
        details: errBody,
      });
      throw err;
    }

    if (res.status === 429) {
      const err = new Error(
        `Verification Service Unavailable: OpenRouter API rate limit / quota exhausted (HTTP 429 RESOURCE_EXHAUSTED).`
      );
      Object.assign(err, {
        status: 429,
        code: 'RESOURCE_EXHAUSTED',
        isQuotaError: true,
        service: 'OpenRouter',
        details: errBody,
      });
      throw err;
    }

    if (res.status >= 500) {
      const err = new Error(
        `Verification Service Unavailable: OpenRouter reasoning service is temporarily unavailable (HTTP ${res.status}). Please try again shortly.`
      );
      Object.assign(err, {
        status: 503,
        code: 'UNAVAILABLE',
        isQuotaError: true,
        service: 'OpenRouter',
        details: errBody,
      });
      throw err;
    }

    const genericErr = new Error(`Verification Service Unavailable: OpenRouter error (HTTP ${res.status}): ${errBody}`);
    Object.assign(genericErr, {
      status: res.status,
      code: 'OPENROUTER_ERROR',
      isQuotaError: true,
      service: 'OpenRouter',
      details: errBody,
    });
    throw genericErr;
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
    error?: {
      message?: string;
      code?: number;
    };
  };

  if (data.error) {
    const err = new Error(`Verification Service Unavailable: OpenRouter API error: ${data.error.message || 'Unknown error'}`);
    Object.assign(err, {
      status: 429,
      code: 'RESOURCE_EXHAUSTED',
      isQuotaError: true,
      service: 'OpenRouter',
      details: JSON.stringify(data.error),
    });
    throw err;
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter response contained no choices or text content.');
  }

  return content;
}

/**
 * Executes reasoning using direct Google GenAI SDK with multi-model fallback:
 * gemini-3.5-flash -> gemini-3.5-flash-lite -> gemini-3.8-flash
 */
export async function callGeminiDirect(
  prompt: string,
  options?: { json?: boolean; max_tokens?: number }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createServiceUnavailableError(
      'GEMINI_API_KEY is not configured on the server.',
      'Gemini'
    );
  }

  const ai = getGeminiClient();
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: options?.max_tokens || 2048,
          responseMimeType: options?.json ? 'application/json' : undefined,
        },
      });

      const text = response.text || '';
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: unknown) {
      console.warn(
        `[TruthLens] Gemini model ${model} attempt failed: ${err instanceof Error ? err.message : String(err)}. Trying alternative model...`
      );
      lastError = err;
    }
  }

  throw (
    lastError ||
    createServiceUnavailableError(
      'All Gemini reasoning models encountered temporary unavailability.',
      'Gemini'
    )
  );
}

let openRouterAuthDisabled = false;

/**
 * Unified reasoning transport:
 * 1. If GEMINI_API_KEY is present, we leverage native Google GenAI with automatic model fallback.
 * 2. If OPENROUTER_API_KEY is provided and not disabled by 401 Unauthorized, we attempt OpenRouter first,
 *    but if it fails (401 auth error, 402 payment required, 429 quota, or 503 unavailable),
 *    we seamlessly fall back to Gemini without crashing the user's verification pipeline.
 * 3. Only if both services fail or no keys are configured is a service-unavailable error thrown.
 */
export async function callLLMReasoning(
  prompt: string,
  options?: { json?: boolean; max_tokens?: number }
): Promise<string> {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY) && !openRouterAuthDisabled;

  // Primary path: If native Gemini is available, use it directly for fast, high-reliability reasoning
  if (hasGemini) {
    try {
      return await callGeminiDirect(prompt, options);
    } catch (geminiErr: unknown) {
      console.warn(
        '[TruthLens] Native Gemini direct reasoning encountered error:',
        geminiErr instanceof Error ? geminiErr.message : String(geminiErr)
      );

      // If Gemini fails and OpenRouter is configured, try OpenRouter as secondary backup
      if (hasOpenRouter) {
        console.log('[TruthLens] Attempting secondary fallback via OpenRouter...');
        try {
          return await callOpenRouter(prompt, options);
        } catch (orErr: unknown) {
          console.error('[TruthLens] Secondary OpenRouter fallback also failed:', orErr);
          if (orErr instanceof Error && (orErr.message.includes('401') || orErr.message.includes('AUTHENTICATION_FAILED'))) {
            openRouterAuthDisabled = true;
          }
        }
      }

      throw geminiErr;
    }
  }

  // If only OpenRouter is available:
  if (hasOpenRouter) {
    try {
      return await callOpenRouter(prompt, options);
    } catch (orErr: unknown) {
      if (orErr instanceof Error && (orErr.message.includes('401') || orErr.message.includes('AUTHENTICATION_FAILED'))) {
        openRouterAuthDisabled = true;
      }
      throw orErr;
    }
  }

  throw createServiceUnavailableError(
    'Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured on the server.',
    'Gemini'
  );
}

export function isGeminiQuotaOrServiceError(err: unknown): boolean {
  if (!err) return false;
  const anyErr = err as Record<string, unknown>;
  if (anyErr.isQuotaError) return true;
  const status = anyErr.status || anyErr.statusCode || anyErr.code;
  if (
    status === 401 ||
    status === 402 ||
    status === 403 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }
  const str = String(err instanceof Error ? `${err.name} ${err.message}` : err) + ' ' + JSON.stringify(anyErr);
  return (
    status === 402 ||
    status === 429 ||
    status === 503 ||
    str.includes('402') ||
    str.includes('PAYMENT_REQUIRED') ||
    str.includes('credits') ||
    str.includes('429') ||
    str.includes('RESOURCE_EXHAUSTED') ||
    str.includes('exceeded your current quota') ||
    str.includes('quota') ||
    str.includes('UNAVAILABLE') ||
    str.includes('high demand') ||
    str.includes('Rate limit') ||
    str.includes('rate-limit') ||
    str.includes('OpenRouter') ||
    str.includes('Verification Service Unavailable')
  );
}

export function createServiceUnavailableError(
  originalMessage?: string,
  serviceProvider?: 'Tavily' | 'Gemini' | 'OpenRouter'
): Error {
  const isTavily = serviceProvider === 'Tavily' || originalMessage?.toLowerCase().includes('tavily');
  const isOpenRouter = serviceProvider === 'OpenRouter' || Boolean(process.env.OPENROUTER_API_KEY);
  const is503 = originalMessage?.includes('503') || originalMessage?.includes('UNAVAILABLE') || originalMessage?.includes('high demand');
  const providerLabel = isTavily
    ? 'Tavily Search API'
    : isOpenRouter
    ? 'OpenRouter reasoning model'
    : 'Gemini reasoning model';
  const serviceName = isTavily ? 'Tavily' : isOpenRouter ? 'OpenRouter' : 'Gemini';

  const message = is503
    ? `Verification Service Unavailable: ${providerLabel} is currently experiencing temporary high demand (503 UNAVAILABLE). Please try again shortly.`
    : `Verification Service Unavailable: ${providerLabel} quota is currently exhausted (HTTP 429 RESOURCE_EXHAUSTED).`;

  const err = new Error(message);
  Object.assign(err, {
    status: is503 ? 503 : 429,
    code: is503 ? 'UNAVAILABLE' : 'RESOURCE_EXHAUSTED',
    isQuotaError: true,
    service: serviceName,
    details: originalMessage || '',
  });
  return err;
}

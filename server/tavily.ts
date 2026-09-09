export interface TavilySearchResultItem {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResultItem[];
}

export function isTavilyQuotaOrServiceError(err: unknown): boolean {
  if (!err) return false;
  const anyErr = err as Record<string, unknown>;
  const status = anyErr.status || anyErr.statusCode || anyErr.code;
  if (status === 429 || status === 401 || status === 403 || status === 503) return true;
  const str = String(err instanceof Error ? `${err.name} ${err.message}` : err) + ' ' + JSON.stringify(anyErr);
  return (
    str.includes('429') ||
    str.includes('quota') ||
    str.includes('rate limit') ||
    str.includes('unauthorized') ||
    str.includes('TAVILY_API_KEY') ||
    str.includes('RESOURCE_EXHAUSTED')
  );
}

// Tavily provides the external web evidence retrieval layer.
export async function searchTavily(
  query: string,
  options: { maxResults?: number; searchDepth?: 'basic' | 'advanced'; includeAnswer?: boolean } = {}
): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    const err = new Error('TAVILY_API_KEY is not configured on the server.');
    Object.assign(err, { status: 503, isQuotaError: true, code: 'TAVILY_KEY_MISSING' });
    throw err;
  }

  const { maxResults = 5, searchDepth = 'basic', includeAnswer = false } = options;

  let response: Response;
  try {
    response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: searchDepth,
        include_answer: includeAnswer,
        max_results: maxResults,
      }),
    });
  } catch (netErr: unknown) {
    const err = new Error(`Tavily search network failure: ${netErr instanceof Error ? netErr.message : String(netErr)}`);
    Object.assign(err, { status: 503, isServiceError: true });
    throw err;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const err = new Error(`Tavily Search API returned HTTP ${response.status}: ${errorBody}`);
    Object.assign(err, {
      status: response.status,
      isQuotaError: response.status === 429 || response.status === 403 || response.status === 401,
      code: response.status === 429 ? 'RESOURCE_EXHAUSTED' : 'TAVILY_API_ERROR',
      details: errorBody,
    });
    throw err;
  }

  const data = (await response.json()) as TavilySearchResponse;
  return {
    query: data.query || query,
    answer: data.answer,
    results: Array.isArray(data.results) ? data.results : [],
  };
}

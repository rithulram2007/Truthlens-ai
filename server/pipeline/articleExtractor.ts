export interface ExtractedArticleData {
  inputType: 'claim' | 'url' | 'article';
  title?: string;
  publisher?: string;
  publicationDate?: string;
  author?: string;
  text: string;
  url?: string;
  fetchError?: string;
}

export function detectInputType(raw: string): 'claim' | 'url' | 'article' {
  const trimmed = raw.trim();
  
  // URL detection
  if (/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(trimmed) || /^www\.[^\s$.?#].[^\s]*$/i.test(trimmed)) {
    return 'url';
  }

  // Article vs single claim
  // If text is long (> 350 chars) or contains 2+ distinct linebreaks or multiple sentences
  const sentenceCount = (trimmed.match(/[.!?](\s+|$)/g) || []).length;
  if (trimmed.length > 350 || sentenceCount >= 3 || trimmed.includes('\n\n')) {
    return 'article';
  }

  return 'claim';
}

export async function extractArticle(input: string): Promise<ExtractedArticleData> {
  const inputType = detectInputType(input);
  const trimmed = input.trim();

  if (inputType === 'claim') {
    return {
      inputType: 'claim',
      text: trimmed,
    };
  }

  if (inputType === 'url') {
    let targetUrl = trimmed;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const urlObj = new URL(targetUrl);
      const publisher = urlObj.hostname.replace(/^www\./, '');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TruthLens/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          inputType: 'url',
          url: targetUrl,
          publisher,
          text: `[URL could not be fetched directly: HTTP ${response.status} ${response.statusText}]. Verification will evaluate the claim based on the URL context: ${targetUrl}`,
          fetchError: `HTTP error ${response.status}: Inaccessible or paywalled source.`,
        };
      }

      const html = await response.text();

      // Extract metadata without fabricating
      const titleMatch =
        html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i) ||
        html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? decodeHTMLEntities(titleMatch[1].trim()) : undefined;

      const authorMatch =
        html.match(/<meta\s+name=["']author["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+property=["']article:author["']\s+content=["'](.*?)["']/i);
      const author = authorMatch ? decodeHTMLEntities(authorMatch[1].trim()) : undefined;

      const dateMatch =
        html.match(/<meta\s+property=["']article:published_time["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+name=["']publish-date["']\s+content=["'](.*?)["']/i) ||
        html.match(/<meta\s+name=["']date["']\s+content=["'](.*?)["']/i);
      const publicationDate = dateMatch ? dateMatch[1].trim().split('T')[0] : undefined;

      // Extract text content: strip scripts, styles, navigations, footers
      let bodyText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Limit bodyText to prevent token overflow
      if (bodyText.length > 5000) {
        bodyText = bodyText.substring(0, 5000) + '...';
      }

      return {
        inputType: 'url',
        url: targetUrl,
        title,
        publisher,
        author,
        publicationDate,
        text: bodyText || `Verification for: ${title || targetUrl}`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        inputType: 'url',
        url: targetUrl,
        publisher: targetUrl.split('/')[2] || 'Web',
        text: `Target URL: ${targetUrl}. [Automatic scraping blocked or timed out: ${message}].`,
        fetchError: `Could not retrieve full article text directly (${message}). Analyzing referenced claim topic.`,
      };
    }
  }

  // Input is article text
  // Extract potential headline if first line is short and followed by paragraph
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  let potentialTitle: string | undefined = undefined;
  if (lines.length > 1 && lines[0].length < 120 && !lines[0].endsWith('.')) {
    potentialTitle = lines[0];
  }

  return {
    inputType: 'article',
    title: potentialTitle,
    text: trimmed,
  };
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

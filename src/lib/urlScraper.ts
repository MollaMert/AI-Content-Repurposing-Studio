import TurndownService from 'turndown';

const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];
const TIMEOUT_MS = 15000;

export async function scrapeUrl(url: string): Promise<string> {
  let targetUrl = url;

  // GitHub Special Handling
  if (url.includes('github.com')) {
    const githubMatch = url.match(/github\.com\/([^/]+)\/([^/]+)(\/?)$/);
    if (githubMatch) {
      const [, user, repo] = githubMatch;
      targetUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/README.md`;
    }
  }

  // 1. Try Direct Fetch (Fastest, works for CORS-enabled sites like GitHub Raw)
  try {
    const content = await fetchWithTimeout(targetUrl, TIMEOUT_MS);
    return content;
  } catch (error) {
    console.warn(`Direct fetch failed for ${targetUrl}, trying proxies...`, error);
  }

  // 2. Try Proxies
  for (const proxyBase of PROXIES) {
    const proxyUrl = `${proxyBase}${encodeURIComponent(targetUrl)}`;
    try {
      const content = await fetchWithTimeout(proxyUrl, TIMEOUT_MS);
      return content;
    } catch (error) {
      console.warn(`Proxy ${proxyBase} failed, trying next...`, error);
    }
  }

  // 3. Last Resort: Try original URL via proxies if targetUrl was modified (e.g. raw github failed)
  if (targetUrl !== url) {
    for (const proxyBase of PROXIES) {
      const proxyUrl = `${proxyBase}${encodeURIComponent(url)}`;
      try {
        const content = await fetchWithTimeout(proxyUrl, TIMEOUT_MS);
        return content;
      } catch {
      console.warn(`Final resort proxy ${proxyBase} failed.`);
    }
    }
  }

  throw new Error('All scraping attempts failed or timed out. Please try pasting the content manually.');
}

async function fetchWithTimeout(url: string, timeout: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const content = await response.text();

    if (contentType.includes('text/html')) {
      return cleanMarkdown(htmlToMarkdown(content));
    }
    return cleanMarkdown(content);
  } finally {
    clearTimeout(timeoutId);
  }
}



function htmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  return turndownService.turndown(html);
}

function cleanMarkdown(markdown: string): string {
  return markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s+$/gm, '')
    .trim();
}

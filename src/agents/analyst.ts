import type { AIClient } from '../lib/ai-client';

export interface AnalysisResult {
  hook: string;
  keywords: string[];
  coreMessage: string;
  targetAudience: string;
  useCases: string[];
}

const SYSTEM_PROMPT = `You are an expert Content Marketer and Strategist. 
Your task is to analyze the provided content (which could be a project README, an article, or a script) and extract high-value marketing insights.

Analyze the content and extract:
1. hook: A high-impact, scroll-stopping hook (1-2 sentences).
2. keywords: An array of 5-10 SEO-optimized keywords/topics.
3. coreMessage: The "Unique Value Proposition" or core message.
4. targetAudience: Identify EXACTLY who this is for (e.g., "React developers looking for better state management").
5. useCases: An array of 3-5 specific real-world scenarios where this content/project is applicable.

Respond ONLY with a valid JSON object in this exact format:
{
  "hook": "string",
  "keywords": ["string", ...],
  "coreMessage": "string",
  "targetAudience": "string",
  "useCases": ["string", ...]
}

Focus on professional, engaging, and persuasive language.`;

export async function analyzeContent(
  content: string,
  client: AIClient,
  brandVoice?: string,
  targetLanguage?: string
): Promise<AnalysisResult> {
  if (!content?.trim()) {
    throw new Error('Content is required');
  }

  const lang = targetLanguage || 'English';
  const customPrompt = `${SYSTEM_PROMPT}\n\nCRITICAL: Analyze and respond entirely in ${lang}. 
${brandVoice ? `Adhere to this BRAND VOICE/CONTEXT during analysis: ${brandVoice}` : ''}`;

  try {
    const response = await client.chat([
      { role: 'system', content: customPrompt },
      { role: 'user', content: content.trim() }
    ], {
      temperature: 0.7,
      maxTokens: 1000
    });

    const parsed = parseResponse(response);

    // Basic structural validation
    if (!parsed.hook || !parsed.keywords || !Array.isArray(parsed.keywords) || !parsed.coreMessage || !parsed.targetAudience || !Array.isArray(parsed.useCases)) {
      throw new Error('Invalid response structure: missing required fields');
    }

    const trimmedKeywords = parsed.keywords.map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    const trimmedUseCases = parsed.useCases.map((u: string) => u.trim()).filter((u: string) => u.length > 0);

    // Relaxed validation to avoid artificial failures
    if (trimmedKeywords.length < 3) {
      throw new Error('At least 3 keywords required');
    }

    return {
      hook: parsed.hook.trim(),
      keywords: trimmedKeywords,
      coreMessage: parsed.coreMessage.trim(),
      targetAudience: parsed.targetAudience.trim(),
      useCases: trimmedUseCases
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Analysis failed: ${String(error)}`);
  }
}

function parseResponse(response: string): AnalysisResult {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const jsonString = jsonMatch[0];
    const parsed = JSON.parse(jsonString) as AnalysisResult;

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
    throw error;
  }
}

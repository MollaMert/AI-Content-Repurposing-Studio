import type { AIClient } from '../lib/ai-client';
import type { AnalysisResult } from './analyst';

interface CritiqueResult {
  gaps: string[];
  questions: string[];
}

const SYSTEM_PROMPT = `You are a Content Strategist and Marketing Critic. 
Given the original content and its preliminary analysis, your job is to identify gaps and missing information that would make the content more effective.

Identify:
1. gaps: What's missing? (e.g., lack of CTA, unclear audience, missing technical details, lack of social proof). List 3-5 gaps.
2. questions: What should we ask the user to fill these gaps? Formulate 2-3 specific questions.

Return JSON: 
{
  "gaps": ["string", ...],
  "questions": ["string", ...]
}`;

export async function critiqueContent(
  content: string,
  analysis: AnalysisResult,
  client: AIClient
): Promise<CritiqueResult> {
  if (!content?.trim()) {
    throw new Error('Content is required');
  }

  try {
    const userMessage = `Original Content:\n${content.trim()}\n\nAnalysis:\nHook: ${analysis.hook}\nKeywords: ${analysis.keywords.join(', ')}\nCore Message: ${analysis.coreMessage}\nTarget Audience: ${analysis.targetAudience}\nUse Cases: ${analysis.useCases.join(', ')}`;

    const response = await client.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ], {
      temperature: 0.7,
      maxTokens: 1000
    });

    const parsed = parseResponse(response);

    const trimmedGaps = (parsed.gaps || []).map((g: string) => g.trim()).filter((g: string) => g.length > 0);
    const trimmedQuestions = (parsed.questions || []).map((q: string) => q.trim()).filter((q: string) => q.length > 0);

    // Relaxed validation
    if (trimmedGaps.length === 0) {
      trimmedGaps.push("No major gaps identified, but could always benefit from more specific social proof.");
    }

    if (trimmedQuestions.length === 0) {
      trimmedQuestions.push("Do you have any specific Call to Action (CTA) in mind?");
    }

    return {
      gaps: trimmedGaps,
      questions: trimmedQuestions
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Critique failed: ${String(error)}`);
  }
}

function parseResponse(response: string): CritiqueResult {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const jsonString = jsonMatch[0];
    const parsed = JSON.parse(jsonString) as CritiqueResult;

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
    throw error;
  }
}

import type { AIClient } from '../lib/ai-client';

export interface ScoreResult {
  score: number;
  label: 'Low' | 'Medium' | 'High' | 'Viral Potential';
  feedback: string[];
}

const SYSTEM_PROMPT = `You are a Social Media Viral Specialist. 
Your task is to analyze a generated post and predict its "Virality Score" (1-100) based on engagement patterns (hooks, structure, clarity, and platform-specific trends).

Evaluate based on:
1. Hook Strength: Is the first line scroll-stopping?
2. Readability: Is it easy to scan/digest?
3. Value/Relatability: Does it solve a problem or evoke emotion?
4. Platform Fit: Does it use the platform's conventions (hashtags, formatting) correctly?

Respond ONLY with a valid JSON object:
{
  "score": number (1-100),
  "label": "Low" | "Medium" | "High" | "Viral Potential",
  "feedback": ["point 1", "point 2", ...]
}`;

export async function scoreContent(
  content: string,
  platform: string,
  client: AIClient
): Promise<ScoreResult> {
  try {
    const response = await client.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Platform: ${platform}\n\nContent:\n${content}` }
    ], {
      temperature: 0.3, // Lower temp for more consistent scoring
      maxTokens: 500
    });

    const parsed = parseResponse(response);
    return parsed;
  } catch (error) {
    console.warn('Scoring failed, returning default score', error);
    return {
      score: 70,
      label: 'Medium',
      feedback: ['Scoring unavailable, but looks good!']
    };
  }
}

function parseResponse(response: string): ScoreResult {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse score response');
  }
}

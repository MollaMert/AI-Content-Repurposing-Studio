import type { AIClient } from '../lib/ai-client';

export async function generateVisualPrompt(
  content: string,
  platform: string,
  client: AIClient
): Promise<string> {
  const systemPrompt = `You are a professional Visual Designer and Prompt Engineer.
Your task is to create a highly detailed image generation prompt (for Imagen 3 or DALL-E) based on the provided social media content.

The image should be:
1. High-quality, modern, and aesthetically pleasing.
2. Relevant to the content's topic and tone.
3. Optimized for social media engagement.
4. Avoid any text in the image.

Rules for the prompt:
- Focus on style, lighting, composition, and mood.
- Style: Photorealistic, 3D Render, or Minimalist Vector (choose what fits best).
- Format: "A [style] of [subject] [details about lighting/mood]..."
- CRITICAL: The prompt MUST be written in English, regardless of the input content's language. Imagen 3 performs best with English prompts.

Respond ONLY with the prompt text. No explanations.`;

  try {
    const response = await client.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Platform: ${platform}\nContent: ${content}` }
    ], {
      temperature: 0.8,
      maxTokens: 300
    });

    return response.trim();
  } catch (error) {
    console.error('Failed to generate visual prompt:', error);
    return `A high-quality, professional conceptual image representing the topic: ${content.substring(0, 50)}`;
  }
}

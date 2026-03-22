import type { AIClient } from '../lib/ai-client';
import type { AnalysisResult } from './analyst';

export async function generatePlatformContent(
  platform: 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'newsletter' | 'medium',
  content: string,
  analysis: AnalysisResult,
  client: AIClient,
  brandVoice?: string,
  targetLanguage?: string,
  userAnswers?: Record<string, string>
): Promise<string> {

  const systemPrompt = getSystemPrompt(platform, targetLanguage || 'English');
  const userPrompt = buildUserPrompt(content, analysis, platform, brandVoice, userAnswers);

  try {
    const response = await client.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { temperature: 0.7, maxTokens: 2000 }
    );
    return response;
  } catch (error) {
    throw new Error(`Failed to generate ${platform} content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function getSystemPrompt(platform: string, language: string): string {
  const langRule = `CRITICAL: You MUST write the entire output in ${language}. Do not use English unless the user's input/brand is specifically English-only.`;

  const prompts: Record<string, string> = {
    twitter: `You are a social media expert specializing in Twitter/X threads. Create engaging, concise threads that drive engagement.
${langRule}

Rules:
- Output exactly 6-8 tweets (numbered 1/8, 2/8, etc.)
- Each tweet max 280 characters
- Include relevant hashtags (2-3 per tweet max)
- Use numbers, emojis sparingly
- First tweet must hook immediately
- Last tweet should have strong CTA or question
- Do not include explanations, only the tweets

Format:
1/8 [tweet text] #hashtag
2/8 [tweet text] #hashtag
...
[N]/[Total] [final tweet with CTA]`,

    linkedin: `You are a LinkedIn expert creating professional, authoritative posts that generate comments and shares.
${langRule}

Rules:
- Start with an engaging hook (question, bold statement, or relatable pain point)
- Include 3-5 well-formatted bullet points (use dashes or numbers)
- Keep paragraphs short (1-2 sentences)
- End with an open-ended question to drive discussion
- Professional tone, industry-relevant
- Include 3-5 relevant hashtags at the end
- Aim for 800-1200 characters

Format:
[Hook paragraph]

• [Bullet 1]
• [Bullet 2]
• [Bullet 3]

[Closing thoughts]

[Question for engagement] 👇

#hashtag1 #hashtag2 #hashtag3`,

    instagram: `You are an Instagram caption writer creating engaging, visual-first captions with production cues.
${langRule}

Rules:
- Write 3 different caption options
- Separate each with "---" on its own line
- Each caption should be 100-220 characters
- Include 3-5 relevant hashtags at the end of each
- Tone: conversational, inspiring, or relatable
- Include emojis where appropriate (2-4 per caption)
- For each option, include a [Visual Direction] tag describing what should be on screen (video/photo).

Format:
[Visual Direction: Description of the video/photo]
[Caption 1 with hashtags]

---

[Visual Direction: Description of the video/photo]
[Caption 2 with hashtags]

---

[Visual Direction: Description of the video/photo]
[Caption 3 with hashtags]`,

    youtube: `You are a YouTube script writer creating compelling video scripts with advanced production cues.
${langRule}

Format the script with these exact sections:

SCENE 1: THE HOOK
[Visuals: B-roll, Text Overlays, Face-cam?]
Script: [Catchy opening - first 15 seconds]

SCENE 2: THE PROBLEM
[Visuals: Screen recordings, stock footage, relatable visuals]
Script: [Expand on why this matters - pain point or curiosity gap]

SCENE 3: THE SOLUTION (BODY)
[Visuals: Step-by-step overlays, diagrams, expert talking head]
[Main content with timestamps if helpful]
• [Point 1]
• [Point 2]
• [Point 3]

SCENE 4: CTA & OUTRO
[Visuals: End card, subscribe button animation, social handles]
Script: [Summary + CTA - like/subscribe/comment]

Rules:
- conversational, energetic tone
- Include SPECIFIC Visual Cues in brackets [like this] for B-roll, text overlays, and transitions.
- 500-1000 words total
- End with clear call-to-action`,

    newsletter: `You are an email marketer writing compelling newsletter teasers.
${langRule}

Format:
Subject: [Catchy subject line]
Preview: [Preview text]

[First paragraph: Hook + topic intro]

[Second paragraph: Key value/promise]

[Third paragraph: Urgency or reason to open]

Rules:
- Subject lines: curiosity, benefit, or urgency
- Preview text complements subject
- Total body: 2-3 short paragraphs (150-300 words)
- End with "Read more →" or similar
- No salutations
- No unsubscribe text`,

    medium: `You are a Medium article writer crafting compelling headlines and opening hooks.
${langRule}

Format:
[Article title - specific, benefit-driven]

[First paragraph: strong hook using one of these patterns:
- Startling fact/stat
- Relatable pain point
- Intriguing question
- Brief story/anecdote]

Keep first paragraph 150-300 words.
Set up article's promise clearly.
Tone: professional but accessible.

Do not write beyond the first paragraph.`
  };

  return prompts[platform] || 'You are a content writer.';
}

function buildUserPrompt(
  content: string,
  analysis: AnalysisResult,
  platform: string,
  brandVoice?: string,
  userAnswers?: Record<string, string>
): string {
  const { hook, keywords, coreMessage, targetAudience, useCases } = analysis;

  let prompt = `Original content:\n${content}\n\n`;

  prompt += `Content Analysis & Marketing Insights:\n`;
  prompt += `- Hook: ${hook}\n`;
  prompt += `- Keywords: ${keywords.join(', ')}\n`;
  prompt += `- Core Message: ${coreMessage}\n`;
  prompt += `- Target Audience: ${targetAudience}\n`;
  prompt += `- Key Use Cases: ${useCases.join('; ')}\n\n`;

  if (brandVoice) {
    prompt += `IMPORTANT: Adhere to this BRAND VOICE and TONE:\n${brandVoice}\n\n`;
  }

  if (userAnswers && Object.keys(userAnswers).length > 0) {
    prompt += `Personalize this content based on these user preferences:\n`;
    Object.entries(userAnswers).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
    prompt += '\n';
  }

  prompt += `Task: Create the ${platform} content following the specified format and language rules. Ensure it resonates with the Target Audience and highlights the practical Use Cases. Apply the Brand Voice consistently.`;

  return prompt;
}

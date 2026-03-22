import type { AnalysisResult } from '../agents/analyst';
import type { ScoreResult } from '../agents/scorer';

export type AIProvider = 'groq' | 'gemini' | 'openrouter' | 'deepseek';

export interface Settings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  brandVoice: string;
  targetLanguage: string;
  // Feature: AI Image Generation (Beta)
  imageGenEnabled: boolean;
  imageModel: string; 
  imageMode: 'platform-specific' | 'unified';
}

export interface PlatformPreview {
  content: string;
  score?: ScoreResult;
  image?: string;
}

export interface ArchivedTask {
  id: string;
  timestamp: number;
  title: string;
  sourceType: 'text' | 'url';
  sourceContent: string;
  sourceUrl?: string;
  analysis: AnalysisResult;
  previews: Record<string, PlatformPreview>;
}

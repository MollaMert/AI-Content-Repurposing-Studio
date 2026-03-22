import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Twitter, Linkedin, Instagram, Youtube, Mail, Target, Lightbulb, TrendingUp, Eye } from 'lucide-react';
import TwitterPreviewComponent from '../components/features/previews/TwitterPreview';
import LinkedInPreviewComponent from '../components/features/previews/LinkedInPreview';
import InstagramPreviewComponent from '../components/features/previews/InstagramPreview';
import YouTubePreviewComponent from '../components/features/previews/YouTubePreview';
import NewsletterPreviewComponent from '../components/features/previews/NewsletterPreview';
import { OmniInput } from '../components/features/OmniInput';
import { LoadingState } from '../components/features/LoadingState';
import { analyzeContent, type AnalysisResult } from '../agents/analyst';
import { critiqueContent } from '../agents/critic';
import { generatePlatformContent } from '../agents/tailor';
import { generateVisualPrompt } from '../agents/designer';
import { createClient } from '../lib/ai-client';
import { scrapeUrl } from '../lib/urlScraper';
import { useSettingsContext } from '../hooks/useSettings';
import type { ArchivedTask, PlatformPreview } from '../types';
import { scoreContent, type ScoreResult } from '../agents/scorer';

type PlatformKey = 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'newsletter' | 'medium';
type PreviewData = Partial<Record<PlatformKey, PlatformPreview>>;

function ScoreBadge({ result }: { result?: ScoreResult | null }) {
  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-amber-400 to-orange-500 text-white';
    if (score >= 70) return 'from-emerald-400 to-teal-500 text-white';
    return 'from-indigo-400 to-purple-500 text-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${getScoreColor(result.score)} shadow-lg shadow-indigo-500/10 cursor-help`}
    >
      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
        <TrendingUp className="w-3.5 h-3.5" />
        {result.label}: {result.score}% 
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 w-64 p-4 rounded-xl bg-gray-900 border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
        <p className="text-indigo-300 font-bold text-xs uppercase mb-2">AI Engagement Analysis</p>
        <ul className="space-y-1.5">
          {result.feedback.map((f, i) => (
            <li key={i} className="text-gray-300 text-xs leading-tight flex gap-2">
              <span className="text-indigo-400 opacity-50">•</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="absolute top-full left-6 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-white/10" />
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const { settings } = useSettingsContext();
  const [, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<PreviewData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visualMode, setVisualMode] = useState<'unified' | 'platform-specific'>(settings.imageMode || 'platform-specific');

  const handleContentChange = useCallback(async (inputContent: string) => {
    if (!inputContent.trim()) return;
    
    if (!settings.apiKey) {
      setError('Please set your API key in Settings first.');
      return;
    }

    setContent(inputContent);
    setIsLoading(true);
    setStage('Analyzing');
    setProgress(5);
    setPreviews(null);
    setAnalysis(null);
    setError(null);

    try {
      const client = createClient(settings.provider, settings.apiKey, settings.model);

      setStage('Strategic Analysis');
      const analysisResult = await analyzeContent(
        inputContent, 
        client, 
        settings.brandVoice, 
        settings.targetLanguage
      );
      setAnalysis(analysisResult);
      setProgress(25);

      setStage('Content Critique');
      await critiqueContent(inputContent, analysisResult, client);
      setProgress(40);

      const results: PreviewData = {};
      let unifiedImage: string | undefined = undefined;
      let imageGenerationError: string | null = null;

      // --- 3. Pre-generate Unified Visual (if mode is unified) ---
      if (settings.imageGenEnabled && visualMode === 'unified' && client.generateImage) {
        try {
          setStage('Designing Unified Visual');
          const visualPrompt = await generateVisualPrompt(analysisResult.hook, 'General Content', client);
          unifiedImage = await client.generateImage(visualPrompt, settings.imageModel);
        } catch (imgErr) {
          const errMsg = imgErr instanceof Error ? imgErr.message : String(imgErr);
          console.warn('Unified visual generation failed:', errMsg);
          imageGenerationError = errMsg;
        }
      }

      const platforms: Array<{ key: PlatformKey; name: string }> = [
        { key: 'twitter', name: 'Twitter' },
        { key: 'linkedin', name: 'LinkedIn' },
        { key: 'instagram', name: 'Instagram' },
        { key: 'youtube', name: 'YouTube' },
        { key: 'newsletter', name: 'Newsletter' },
        { key: 'medium', name: 'Medium' },
      ];

      for (let i = 0; i < platforms.length; i++) {
        const { key, name } = platforms[i];
        setStage(`Creating ${name}`);
        const startProgress = 40 + (i * 10);
        const endProgress = startProgress + 10;
        setProgress(startProgress);

        try {
          // 1. Generate Text Content
          const contentResult = await generatePlatformContent(
            key,
            inputContent, 
            analysisResult, 
            client,
            settings.brandVoice,
            settings.targetLanguage
          );
          
          // 2. Score (Engagement Prediction)
          setStage(`Scoring ${name}`);
          const score = await scoreContent(contentResult, name, client);
          
          // 3. Visual Logic
          let imageUrl = unifiedImage;
          if (settings.imageGenEnabled && visualMode === 'platform-specific' && client.generateImage) {
            try {
              setStage(`Designing Visuals for ${name}`);
              
              // We clean the content for certain platforms to help the Designer agent
              let visualContext = contentResult;
              if (key === 'instagram') {
                // Extract [Visual Direction] if exists, otherwise take first caption
                const visualMatch = contentResult.match(/\[Visual Direction:\s*(.*?)\]/i);
                if (visualMatch) {
                  visualContext = visualMatch[1];
                } else {
                  visualContext = contentResult.split('---')[0].trim();
                }
              } else if (key === 'youtube') {
                // For YouTube, extract SCENE 1 visuals or HOOK
                const visualMatch = contentResult.match(/\[Visuals:\s*(.*?)\]/i);
                if (visualMatch) visualContext = visualMatch[1];
              }

              const visualPrompt = await generateVisualPrompt(visualContext, name, client);
              imageUrl = await client.generateImage(visualPrompt, settings.imageModel);
            } catch (imgErr) {
              const errMsg = imgErr instanceof Error ? imgErr.message : String(imgErr);
              console.warn(`Visual generation failed for ${name}:`, errMsg);
              imageGenerationError = errMsg; // Store error to surface it
            }
          }
          
          results[key] = { content: contentResult, score, image: imageUrl };
          setProgress(endProgress);
        } catch (err) {
          console.error(`Error generating ${name}:`, err);
          results[key] = { content: `[Error generating ${name}]` };
        }
      }

      if (settings.imageGenEnabled && !unifiedImage && visualMode === 'unified') {
         setError(`Unified Image failed: ${imageGenerationError || 'Unknown error'}. Check Settings -> Image Model or your API key access.`);
      } else if (settings.imageGenEnabled && visualMode === 'platform-specific' && imageGenerationError) {
         setError(`Some visuals failed to generate: ${imageGenerationError}. Check Settings -> Image Model.`);
      }

      setStage('Finalizing');
      setProgress(100);
      setPreviews(results);

      // --- PERSIST TO HISTORY (Archive) ---
      try {
        const archivedTask: ArchivedTask = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          title: analysisResult.hook.substring(0, 50) + '...',
          sourceType: inputContent.startsWith('http') ? 'url' : 'text',
          sourceContent: inputContent,
          analysis: analysisResult,
          previews: results
        };
        const existingRaw = localStorage.getItem('ai-studio-history');
        const history = existingRaw ? JSON.parse(existingRaw) : [];
        const nextHistory = [archivedTask, ...history].slice(0, 50);
        localStorage.setItem('ai-studio-history', JSON.stringify(nextHistory));
      } catch (saveErr) {
        console.warn('History persistence failed:', saveErr);
      }
      // ------------------------------------

      setTimeout(() => {
        setIsLoading(false);
        setStage('');
        setProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
      setStage('');
      setProgress(0);
    }
  }, [settings, visualMode]); // Added visualMode to dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Content Repurposing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Content Repurposing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Studio</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your content into optimized posts for every platform. Twitter, LinkedIn, Instagram, YouTube, and more.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          {[
            { icon: Twitter, label: 'Twitter/X', color: 'hover:text-blue-400' },
            { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-500' },
            { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400' },
            { icon: Youtube, label: 'YouTube', color: 'hover:text-red-400' },
            { icon: Mail, label: 'Newsletter', color: 'hover:text-purple-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className={`p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 transition-all duration-200 ${color}`}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </div>
          ))}
        </motion.div>

        {!isLoading && !previews && (
          <div className="max-w-4xl mx-auto">
            {/* Quick Visual Strategy Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Eye className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Visual Strategy</h3>
                  <p className="text-gray-500 text-xs">How should AI generate images?</p>
                </div>
              </div>
              
              <div className="flex p-1 rounded-xl bg-gray-900/50 border border-white/5">
                <button
                  onClick={() => setVisualMode('platform-specific')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    visualMode === 'platform-specific' 
                      ? 'bg-indigo-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Each Platform Unique
                </button>
                <button
                  onClick={() => setVisualMode('unified')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    visualMode === 'unified' 
                      ? 'bg-indigo-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Single Unified Image
                </button>
              </div>
            </div>

            <OmniInput 
              onContentChange={handleContentChange} 
              onScrapeUrl={scrapeUrl}
            />
          </div>
        )}

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {isLoading && (
          <LoadingState stage={stage} progress={progress} />
        )}

        {previews && analysis && !isLoading && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-6xl mx-auto mb-12 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white tracking-tight">Strategy & Marketing Insights</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-300 font-medium">
                    <Target className="w-4 h-4" />
                    <span>Target Audience</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {analysis.targetAudience}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-300 font-medium">
                    <Lightbulb className="w-4 h-4" />
                    <span>Key Use Cases</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis.useCases.map((useCase, i) => (
                      <li key={i} className="text-gray-300 text-sm flex gap-2">
                        <span className="text-indigo-500">•</span>
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Your Content Previews
              </h2>
              <p className="text-gray-400 text-sm">
                Review and copy your optimized content for each platform
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {previews.twitter && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <ScoreBadge result={previews.twitter.score} />
                  </div>
                  <TwitterPreviewComponent content={previews.twitter.content} image={previews.twitter.image} />
                </div>
              )}
              {previews.linkedin && (
                <div className="space-y-4">
                  <ScoreBadge result={previews.linkedin.score} />
                  <LinkedInPreviewComponent content={previews.linkedin.content} image={previews.linkedin.image} />
                </div>
              )}
              {previews.instagram && (
                <div className="space-y-4">
                  <ScoreBadge result={previews.instagram.score} />
                  <InstagramPreviewComponent content={previews.instagram.content} image={previews.instagram.image} />
                </div>
              )}
              {previews.youtube && (
                <div className="space-y-4">
                  <ScoreBadge result={previews.youtube.score} />
                  <YouTubePreviewComponent content={previews.youtube.content} image={previews.youtube.image} />
                </div>
              )}
              {previews.newsletter && (
                <div className="space-y-4">
                  <ScoreBadge result={previews.newsletter.score} />
                  <NewsletterPreviewComponent content={previews.newsletter.content} />
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8"
            >
              <button
                onClick={() => {
                  setPreviews(null);
                  setContent('');
                }}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all duration-200"
              >
                Analyze New Content
              </button>
            </motion.div>
          </>
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 text-gray-500 text-xs"
        >
          <p>Powered by AI. Review all content before publishing.</p>
        </motion.footer>
      </div>
    </div>
  );
}

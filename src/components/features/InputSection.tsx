import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Link as LinkIcon, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface InputSectionProps {
  onAnalyze: (content: string, url?: string) => void;
  isLoading?: boolean;
  loadingStep?: string;
}

export function InputSection({ onAnalyze, isLoading = false, loadingStep }: InputSectionProps) {
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAnalyze(content.trim(), url.trim() || undefined);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Textarea */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300">
              Paste your content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your blog post, article, video transcript, or any content you want to repurpose..."
              rows={6}
              className={clsx(
                'w-full px-4 py-3 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white placeholder-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
                'resize-none transition-all duration-200',
                'font-sans text-sm leading-relaxed'
              )}
            />
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Source URL <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className={clsx(
                'w-full px-4 py-3 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white placeholder-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
                'transition-all duration-200',
                'font-sans text-sm'
              )}
            />
          </div>

          {/* Analyze Button */}
          <motion.button
            type="submit"
            disabled={!content.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              'w-full py-4 px-6 rounded-xl',
              'bg-indigo-500 hover:bg-indigo-600',
              'disabled:bg-indigo-500/50 disabled:cursor-not-allowed',
              'text-white font-semibold',
              'flex items-center justify-center gap-3',
              'transition-all duration-200',
              'shadow-lg shadow-indigo-500/25'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{loadingStep || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze & Create Previews</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Character Count */}
        <div className="mt-4 text-right text-xs text-gray-500">
          {content.length} characters
        </div>
      </div>
    </motion.div>
  );
}

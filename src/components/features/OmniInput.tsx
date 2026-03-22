import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Link, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OmniInputMode = 'text' | 'url';

export interface OmniInputProps {
  mode?: OmniInputMode;
  onContentChange: (content: string) => void;
  onScrapeUrl?: (url: string) => Promise<string>;
  className?: string;
  placeholder?: string;
  initialValue?: string;
  disabled?: boolean;
}

interface OmniInputState {
  text: string;
  url: string;
  isLoading: boolean;
  error: string | null;
}

export function OmniInput({
  mode: controlledMode,
  onContentChange,
  onScrapeUrl,
  className,
  placeholder = "Paste your content here...",
  initialValue = '',
  disabled = false,
}: OmniInputProps) {
  const [internalMode, setInternalMode] = useState<OmniInputMode>('text');
  const [state, setState] = useState<OmniInputState>({
    text: initialValue,
    url: '',
    isLoading: false,
    error: null,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentMode = controlledMode ?? internalMode;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [state.text]);

  // Sync with initialValue
  useEffect(() => {
    setState(prev => ({ ...prev, text: initialValue }));
  }, [initialValue]);

  const handleTextChange = (value: string) => {
    setState(prev => ({ ...prev, text: value, error: null }));
    onContentChange(value);
  };

  const handleUrlSubmit = async () => {
    if (!state.url.trim() || !onScrapeUrl) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const scrapedContent = await onScrapeUrl(state.url.trim());
      handleTextChange(scrapedContent);
      setState(prev => ({ ...prev, url: '', isLoading: false }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to scrape URL',
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleUrlSubmit();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <motion.button
          type="button"
          onClick={() => setInternalMode('text')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
            currentMode === 'text'
              ? 'bg-accent text-white'
              : 'bg-glass border border-glass-border text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          <FileText className="w-4 h-4" />
          Text
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setInternalMode('url')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
            currentMode === 'url'
              ? 'bg-accent text-white'
              : 'bg-glass border border-glass-border text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          <Link className="w-4 h-4" />
          URL
        </motion.button>
      </div>

      {/* Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {/* Text Mode */}
          {currentMode === 'text' && (
            <motion.div
              key="text-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                ref={textareaRef}
                value={state.text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                rows={8}
                className={cn(
                  'w-full px-4 py-3 rounded-xl resize-none',
                  'bg-glass border border-glass-border backdrop-blur-sm',
                  'text-white placeholder:text-white/40',
                  'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
                  'transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'font-sans text-sm leading-relaxed min-h-[120px]'
                )}
              />
              <div className="mt-2 text-right text-xs text-white/40">
                {state.text.length} characters
              </div>
            </motion.div>
          )}

          {/* URL Mode */}
          {currentMode === 'url' && (
            <motion.div
              key="url-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="url"
                    value={state.url}
                    onChange={(e) => setState(prev => ({ ...prev, url: e.target.value, error: null }))}
                    onKeyDown={handleKeyDown}
                    placeholder="https://example.com/article"
                    disabled={disabled || state.isLoading}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl',
                      'bg-glass border border-glass-border backdrop-blur-sm',
                      'text-white placeholder:text-white/40',
                      'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
                      'transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'font-sans text-sm'
                    )}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!state.url.trim() || state.isLoading || disabled || !onScrapeUrl}
                  className={cn(
                    'px-6 py-3 rounded-xl font-medium flex items-center gap-2',
                    'bg-accent hover:bg-accent-hover text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200'
                  )}
                >
                  {state.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Scrape'
                  )}
                </button>
              </div>
              <p className="text-xs text-white/40">
                Press Cmd/Ctrl + Enter to scrape
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'mt-3 p-3 rounded-lg flex items-center gap-2',
                'bg-red-500/10 border border-red-500/30 text-red-400'
              )}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{state.error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

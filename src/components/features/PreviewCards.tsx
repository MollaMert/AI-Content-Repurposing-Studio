import { motion } from 'framer-motion';
import { Copy, Download, FileJson, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import TwitterPreview from './previews/TwitterPreview';
import LinkedInPreview from './previews/LinkedInPreview';
import InstagramPreview from './previews/InstagramPreview';
import YouTubePreview from './previews/YouTubePreview';
import NewsletterPreview from './previews/NewsletterPreview';

interface PreviewData {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  newsletter?: string;
}

interface PreviewCardsProps {
  previews?: PreviewData;
  isLoading?: boolean;
  onCopyAll?: () => void;
  onExportMarkdown?: () => void;
  onExportJSON?: () => void;
}

// Placeholder content for demo
const placeholderContent = {
  twitter: "Just discovered that consistency beats perfection every single time. \n\nThe content you ship that isn't quite perfect will always outperform the 'perfect' content you never publish.\n\nShip more. Iterate. Grow. 🚀",
  linkedin: `Thrilled to share some insights from my journey building in public!\n\nHere's what actually worked for me:\n\n• Post daily, even when it feels uncomfortable\n• Engage with 5 others before posting yourself\n• Share the process, not just the outcome\n• Build genuine relationships, not just followers\n\nThe compound effect is real. Start today. #Entrepreneurship #Growth #BuildingInPublic`,
  instagram: `The truth about growing online 🎯\n\nYou don't need another course or template.\n\nYou need to start before you're ready.\n\nSave this for when you need motivation.\n\n#ContentCreation #GrowthMindset #OnlineBusiness`,
  tiktok: `POV: You finally stop overthinking and start creating\n\nThe algorithm rewards consistency, not perfection.\n\nPost that video. Write that post. Ship that project.\n\nYour future self will thank you.`,
  youtube: `Today I want to share the exact system I use to create content that converts. Many creators make the mistake of focusing on views instead of value. Let me break down exactly what you need to do differently.`,
  newsletter: `Hi there,

I wanted to reach out with something that's been on my mind lately.

The biggest misconception about success is that it's a destination. It's not. Success is a daily practice.

Every morning, you wake up and make choices that move you closer to your goals or further away from them.

Here's my simple framework:

1. Start with why - Why are you doing this?
2. Focus on one thing - What matters most today?
3. Execute imperfectly - Done beats perfect every time
4. Review and adjust - What worked? What didn't?

Remember, the compound effect is real. Small daily improvements lead to remarkable results over time.

Let's connect and grow together.`,
};

export function PreviewCards({
  previews,
  isLoading = false,
  onCopyAll,
  onExportMarkdown,
  onExportJSON,
}: PreviewCardsProps) {
  const content = previews || placeholderContent;

  // Combine all content for copy all
  const allContent = `
# Twitter/X
${content.twitter || placeholderContent.twitter}

# LinkedIn
${content.linkedin || placeholderContent.linkedin}

# Instagram
${content.instagram || placeholderContent.instagram}

# TikTok
${content.tiktok || placeholderContent.tiktok}

# YouTube Script
${content.youtube || placeholderContent.youtube}

# Newsletter
${content.newsletter || placeholderContent.newsletter}
`.trim();

  const handleCopyAll = () => {
    navigator.clipboard.writeText(allContent);
    onCopyAll?.();
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([allContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-previews.md';
    a.click();
    URL.revokeObjectURL(url);
    onExportMarkdown?.();
  };

  const handleExportJSON = () => {
    const jsonData = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-previews.json';
    a.click();
    URL.revokeObjectURL(url);
    onExportJSON?.();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className="text-gray-400">Generating your previews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyAll}
          className={clsx(
            'px-4 py-2 rounded-lg',
            'bg-white/5 hover:bg-white/10',
            'border border-white/10',
            'text-gray-300 text-sm',
            'flex items-center gap-2',
            'transition-all duration-200'
          )}
        >
          <Copy className="w-4 h-4" />
          Copy All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportMarkdown}
          className={clsx(
            'px-4 py-2 rounded-lg',
            'bg-indigo-500/20 hover:bg-indigo-500/30',
            'border border-indigo-500/30',
            'text-indigo-400 text-sm',
            'flex items-center gap-2',
            'transition-all duration-200'
          )}
        >
          <Download className="w-4 h-4" />
          Export to Markdown
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportJSON}
          className={clsx(
            'px-4 py-2 rounded-lg',
            'bg-purple-500/20 hover:bg-purple-500/30',
            'border border-purple-500/30',
            'text-purple-400 text-sm',
            'flex items-center gap-2',
            'transition-all duration-200'
          )}
        >
          <FileJson className="w-4 h-4" />
          Export to JSON
        </motion.button>
      </div>

      {/* Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Twitter/X Preview */}
        <TwitterPreview content={content.twitter || placeholderContent.twitter} />

        {/* LinkedIn Preview */}
        <LinkedInPreview content={content.linkedin || placeholderContent.linkedin} />

         {/* Instagram Preview */}
         <InstagramPreview content={content.instagram || placeholderContent.instagram} />

        {/* YouTube Script Preview */}
        <YouTubePreview content={content.youtube || placeholderContent.youtube} />

        {/* Newsletter Preview */}
        <div className="md:col-span-2 lg:col-span-2">
          <NewsletterPreview content={content.newsletter || placeholderContent.newsletter} />
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-gray-500 text-xs">
        These are AI-generated previews. Review and edit before publishing.
      </p>
    </motion.div>
  );
}

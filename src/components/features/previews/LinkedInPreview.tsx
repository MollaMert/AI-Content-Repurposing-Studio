import { motion } from 'framer-motion';
import { Copy, Check, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface LinkedInPreviewProps {
  content: string;
  image?: string;
  name?: string;
  headline?: string;
  onCopy?: () => void;
}

export default function LinkedInPreview({
  content,
  image,
  name = "Alexandra Rivera",
  headline = "Head of Growth at TechStart | Forbes 30 Under 30",
  onCopy,
}: LinkedInPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <span key={i} className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">•</span>
            <span>{line.replace(/^[•-]\s*/, '')}</span>
          </span>
        );
      }
      const parts = line.split(/(\s#[a-zA-Z0-9_]+)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('#') ? (
              <span key={j} className="text-blue-400 font-medium">{part}</span>
            ) : (
              part
            )
          )}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden max-w-[600px]"
    >
      <div className="p-4 flex items-start gap-3 border-b border-white/5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{name}</p>
          <p className="text-gray-400 text-xs leading-tight">{headline}</p>
          <p className="text-gray-500 text-xs mt-1">1h • 🌐</p>
        </div>
        <Linkedin className="w-5 h-5 text-blue-500 shrink-0" />
      </div>
      <div className="p-4 space-y-3">
        <div className="text-white text-sm leading-relaxed space-y-2">
          {formatContent(content)}
        </div>
        {image && (
          <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <img src={image} alt="LinkedIn Image" className="w-full h-auto object-cover" />
          </div>
        )}
      </div>
      <div className="px-4 py-3 flex items-center gap-4 border-t border-white/5 text-gray-400 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">👍</span>
          <span>2,847</span>
        </span>
        <span>142 comments • 89 shares</span>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={handleCopy}
          className={clsx(
            'w-full py-2 px-4 rounded-lg',
            'flex items-center justify-center gap-2',
            'transition-all duration-200',
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Post</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

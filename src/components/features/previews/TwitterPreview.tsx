import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat2, Copy, Check, Twitter } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface TwitterPreviewProps {
  content: string;
  image?: string;
  username?: string;
  handle?: string;
  onCopy?: () => void;
}

interface Tweet {
  text: string;
}

export default function TwitterPreview({
  content,
  image,
  username = "Sarah Chen",
  handle = "@sarahchen",
  onCopy,
}: TwitterPreviewProps) {
  const [copied, setCopied] = useState(false);

  // Split content into tweets by double newlines (thread)
  const tweets: Tweet[] = content.split(/\n\s*\n/).filter(t => t.trim()).map(text => ({ text }));

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden max-w-[600px] min-h-[400px]"
    >
      {/* Header - only shown on first tweet */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {username.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold text-sm">{username}</p>
            <Twitter className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-gray-400 text-xs">{handle}</p>
        </div>
        <div className="text-gray-500 text-xs">2h</div>
      </div>

      {/* Content - Thread bubbles */}
      <div className="p-4 space-y-4">
        {image && (
          <div className="rounded-2xl overflow-hidden border border-white/10 mb-2">
            <img src={image} alt="Tweet Image" className="w-full h-auto object-cover" />
          </div>
        )}
        {tweets.map((tweet, index) => (
          <div key={index} className={clsx(
            index > 0 && "border-l-2 border-white/20 pl-4 relative before:absolute before:top-[-8px] before:left-[-9px] before:w-4 before:h-4 before:bg-white/5 before:border-l-2 before:border-b-2 before:border-white/20 before:rounded-bl-lg"
          )}>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{tweet.text}</p>
          </div>
        ))}
      </div>

      {/* Engagement Icons */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-1 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">12</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 hover:text-green-400 cursor-pointer transition-colors">
          <Repeat2 className="w-5 h-5" />
          <span className="text-xs">24</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 hover:text-red-400 cursor-pointer transition-colors">
          <Heart className="w-5 h-5" />
          <span className="text-xs">186</span>
        </div>
      </div>

      {/* Copy Button */}
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
              <span>Copy Thread</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

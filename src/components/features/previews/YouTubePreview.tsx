import { motion } from 'framer-motion';
import { Play, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface YouTubePreviewProps {
  content: string;
  image?: string;
  title?: string;
  channelName?: string;
  views?: string;
  time?: string;
  onCopy?: () => void;
}

export default function YouTubePreview({
  content,
  image,
  title = "The Ultimate Guide to Growing Your Audience",
  channelName = "Your Channel",
  views = "24K",
  time = "2 days ago",
  onCopy,
}: YouTubePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  // Format content into description with line breaks
  const formatDescription = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i} className="block mb-2 last:mb-0">{line}</span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden max-w-[600px]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-2xl">
        {image && <img src={image} alt="YouTube Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-16 h-16 text-white/60 drop-shadow-2xl" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
          9:24
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{title}</h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {channelName.charAt(0)}
            </div>
            <div>
              <p className="text-gray-300 text-xs font-medium">{channelName}</p>
              <div className="flex items-center gap-2 text-gray-500 text-[10px]">
                <span>{views} views</span>
                <span>•</span>
                <span>{time}</span>
              </div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSubscribed(!subscribed)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              subscribed
                ? 'bg-gray-600 text-gray-300'
                : 'bg-red-600 hover:bg-red-700 text-white'
            )}
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </motion.button>
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-lg p-3 mb-3">
          <p className="text-gray-300 text-xs leading-relaxed">
            {formatDescription(content)}
          </p>
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
              <span>Copy Description</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, Instagram, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import SocialPreview from './SocialPreview';

interface InstagramPreviewProps {
  content: string;
  image?: string;
  username?: string;
  likes?: string;
  comments?: string;
  time?: string;
  onCopy?: () => void;
}

export default function InstagramPreview({
  content,
  image,
  username = "creative_mind",
  likes = "2,847",
  comments = "142",
  time = "2 hours ago",
  onCopy,
}: InstagramPreviewProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const formatCaption = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Handle hashtags
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
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <SocialPreview platform="instagram" title={`@${username}`}>
      <div className="space-y-4">
        {/* Image Display or Placeholder */}
        <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-orange-600/30 flex items-center justify-center">
          {image ? (
            <img src={image} alt="Instagram Post" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <Instagram className="w-16 h-16 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Image Preview</p>
            </div>
          )}
        </div>

        {/* Engagement icons */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className={clsx(
                'flex items-center gap-2 transition-colors',
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              )}
            >
              <Heart className={clsx('w-6 h-6', liked && 'fill-current')} />
              <span className="text-sm">{liked ? 'Liked' : likes}</span>
            </motion.button>
            <div className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm">{comments}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer">
              <Send className="w-6 h-6" />
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSaved(!saved)}
            className={clsx(
              'transition-colors',
              saved ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
            )}
          >
            <Bookmark className={clsx('w-6 h-6', saved && 'fill-current')} />
          </motion.button>
        </div>

        {/* Caption */}
        <div className="text-white text-sm leading-relaxed space-y-2">
          <p className="font-semibold">{username}</p>
          <p>{formatCaption(content)}</p>
        </div>

        {/* Comments preview */}
        <div className="text-gray-400 text-xs">
          View all {comments} comments
        </div>

        {/* Time */}
        <div className="text-gray-500 text-xs uppercase">{time}</div>
      </div>

      {/* Copy Button */}
      <div className="px-4 pb-4 mt-4">
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
              <span>Copy Caption</span>
            </>
          )}
        </button>
      </div>
    </SocialPreview>
  );
}

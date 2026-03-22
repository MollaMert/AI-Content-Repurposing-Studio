import { motion } from 'framer-motion';
import { Mail, Copy, Check, Send } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface NewsletterPreviewProps {
  content: string;
  subject?: string;
  previewText?: string;
  onCopy?: () => void;
}

export default function NewsletterPreview({
  content,
  subject = "🚀 5 Strategies That Doubled My Productivity",
  previewText = "Here's what I've been working on...",
  onCopy,
}: NewsletterPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  // Format content for email
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Format bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <span key={i} className="flex items-start gap-2 mb-2">
            <span className="text-indigo-400 mt-1 shrink-0">•</span>
            <span className="text-gray-300">{line.replace(/^[•-]\s*/, '')}</span>
          </span>
        );
      }
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={i} className="text-gray-300 mb-3 last:mb-0 leading-relaxed">
            {line}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Email Container */}
      <div className="bg-white rounded-lg mx-4 mt-4 overflow-hidden shadow-2xl">
        {/* Email Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <p className="font-semibold text-sm">Growth Insider</p>
              <p className="text-white/70 text-xs">newsletter@growthinsider.com</p>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="p-5">
          {/* Subject Line */}
          <div className="border-b border-gray-100 pb-4 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subject</p>
            <h2 className="text-gray-900 font-semibold text-base">{subject}</h2>
            <p className="text-gray-500 text-sm mt-1">Preview: {previewText}</p>
          </div>

          {/* Body */}
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">Hi there,</p>
            <div className="text-gray-700 leading-relaxed">
              {formatContent(content)}
            </div>
            {/* CTA Button */}
            <div className="pt-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                Read More
              </button>
            </div>
            {/* Signature */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                Best regards,<br />
                <span className="font-semibold text-gray-800">The Growth Team</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Send className="w-3 h-3" />
          Newsletter Preview
        </span>
        <span>~2 min read</span>
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
              <span>Copy Email</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SocialPreviewProps {
  children: ReactNode;
  platform: 'twitter' | 'linkedin' | 'instagram' | 'youtube';
  title?: string;
}

const platformConfig = {
  twitter: {
    icon: Twitter,
    gradient: 'from-blue-400 to-blue-500',
    name: 'Twitter / X',
  },
  linkedin: {
    icon: Linkedin,
    gradient: 'from-blue-600 to-cyan-500',
    name: 'LinkedIn',
  },
  instagram: {
    icon: Instagram,
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    name: 'Instagram',
  },
  youtube: {
    icon: Youtube,
    gradient: 'from-red-500 to-red-600',
    name: 'YouTube',
  },
};

export default function SocialPreview({
  children,
  platform,
  title,
}: SocialPreviewProps) {
  const config = platformConfig[platform];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden max-w-[600px]"
    >
      {/* Header */}
      <div className={cn('p-4 bg-gradient-to-r', config.gradient, 'bg-opacity-20')}>
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br', config.gradient, 'flex items-center justify-center')}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{config.name}</p>
            {title && <p className="text-gray-400 text-xs">{title}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}

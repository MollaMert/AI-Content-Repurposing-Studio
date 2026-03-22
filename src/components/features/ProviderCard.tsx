import { type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import type { AIProvider } from '../../types';

interface ProviderCardProps {
  provider: AIProvider;
  name: string;
  description: string;
  icon: ReactNode;
  defaultModel: string;
  docsUrl: string;
  selected: boolean;
  onSelect: () => void;
}

export function ProviderCard({
  name,
  description,
  icon,
  docsUrl,
  selected,
  onSelect,
}: ProviderCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full p-6 rounded-2xl text-left transition-all duration-300
        border backdrop-blur-sm
        ${
          selected
            ? 'bg-accent/10 border-accent shadow-lg shadow-accent/20'
            : 'bg-glass border-glass-border hover:bg-white/5 hover:border-white/20'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            p-3 rounded-xl transition-colors
            ${selected ? 'bg-accent/20' : 'bg-white/10'}
          `}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            {selected && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent text-white rounded-full">
                Selected
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 mt-3 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Get API Key <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </button>
  );
}

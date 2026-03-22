import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AIProvider } from '../types';

interface Settings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  brandVoice: string;
  targetLanguage: string;
  imageGenEnabled: boolean;
  imageModel: string;
  imageMode: 'platform-specific' | 'unified';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('ai-studio-settings');
    const defaults: Settings = { 
      provider: 'groq' as const, 
      apiKey: '', 
      model: 'llama-3.3-70b-versatile',
      brandVoice: 'Professional, direct, and slightly technical.',
      targetLanguage: 'English',
      imageGenEnabled: false,
      imageModel: 'imagen-4.0-fast-generate-001',
      imageMode: 'platform-specific'
    };
    
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch {
        return defaults;
      }
    }
    return defaults;
  });

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('ai-studio-settings', JSON.stringify(next));
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}

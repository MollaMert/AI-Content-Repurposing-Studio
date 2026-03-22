import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, Eye, EyeOff, AlertCircle, Zap, 
  Sparkles, Globe, Brain, CheckCircle2, Loader2, RefreshCw
} from 'lucide-react';
import { ProviderCard } from '../components/features/ProviderCard';
import { useSettingsContext } from '../hooks/useSettings';
import { createClient } from '../lib/ai-client';
import type { AIProvider } from '../types';

const PROVIDERS = {
  groq: {
    name: 'Groq',
    description: 'Fast inference, great for quick iterations',
    icon: <Zap className="w-6 h-6 text-orange-400" />,
    defaultModel: 'llama-3.3-70b-versatile',
    docsUrl: 'https://console.groq.com/keys',
  },
  gemini: {
    name: 'Gemini',
    description: 'High reasoning, Google\'s latest model',
    icon: <Sparkles className="w-6 h-6 text-blue-400" />,
    defaultModel: 'gemini-2.5-flash-preview-05-20',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Access to 100+ models',
    icon: <Globe className="w-6 h-6 text-purple-400" />,
    defaultModel: 'anthropic/claude-3.5-sonnet',
    docsUrl: 'https://openrouter.ai/keys',
  },
  deepseek: {
    name: 'DeepSeek',
    description: 'Cost-efficient, excellent reasoning',
    icon: <Brain className="w-6 h-6 text-teal-400" />,
    defaultModel: 'deepseek-chat',
    docsUrl: 'https://platform.deepseek.com/api_key',
  },
} as const;

export function Settings() {
  const { settings, updateSettings } = useSettingsContext();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey);
  const [modelInput, setModelInput] = useState(settings.model);
  const [brandVoiceInput, setBrandVoiceInput] = useState(settings.brandVoice);
  const [targetLanguageInput, setTargetLanguageInput] = useState(settings.targetLanguage);
  const [imageGenEnabledInput, setImageGenEnabledInput] = useState(settings.imageGenEnabled);
  const [imageModelInput, setImageModelInput] = useState(settings.imageModel || 'imagen-4.0-fast-generate-001');
  const [imageModeInput, setImageModeInput] = useState<'platform-specific' | 'unified'>(settings.imageMode || 'platform-specific');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [modelList, setModelList] = useState<string[]>([]);
  const [showRawModels, setShowRawModels] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [manualImageModel, setManualImageModel] = useState(false);

  const validateKey = async () => {
    if (!apiKeyInput) return;
    setIsValidating(true);
    setValidationStatus('idle');
    try {
      const client = createClient(settings.provider, apiKeyInput, modelInput || PROVIDERS[settings.provider].defaultModel);
      const models = await client.listModels();
      setModelList(models);
      setValidationStatus('success');
      // If current model not in new list, pick first one
      if (models.length > 0 && !models.includes(modelInput)) {
        setModelInput(models[0]);
      }
    } catch (err) {
      console.error('Validation failed:', err);
      setValidationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleProviderSelect = (provider: AIProvider) => {
    updateSettings({
      provider,
      model: PROVIDERS[provider].defaultModel,
    });
    setModelInput(PROVIDERS[provider].defaultModel);
    setValidationStatus('idle');
    setModelList([]);
  };

  const handleSave = () => {
    updateSettings({
      apiKey: apiKeyInput,
      model: modelInput,
      brandVoice: brandVoiceInput,
      targetLanguage: targetLanguageInput,
      imageGenEnabled: imageGenEnabledInput,
      imageModel: imageModelInput,
      imageMode: imageModeInput,
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const selectedProvider = PROVIDERS[settings.provider];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 rounded-xl bg-accent/20">
            <SettingsIcon className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Settings</h1>
        </div>

        {/* AI Provider Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">AI Provider</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(PROVIDERS) as AIProvider[]).map((provider) => (
              <ProviderCard
                key={provider}
                provider={provider}
                {...PROVIDERS[provider]}
                selected={settings.provider === provider}
                onSelect={() => handleProviderSelect(provider)}
              />
            ))}
          </div>
        </section>

        {/* API Configuration Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">API Configuration</h2>
          </div>
          <div className="p-8 rounded-2xl bg-glass border border-glass-border backdrop-blur-xl">
            {/* API Key Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="api-key">
                API Key
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setValidationStatus('idle');
                    }}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={validateKey}
                  disabled={!apiKeyInput || isValidating}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                    validationStatus === 'success' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : validationStatus === 'error'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-accent hover:bg-accent-hover text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isValidating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : validationStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : validationStatus === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  {validationStatus === 'success' ? 'Verified' : 'Verify & Fetch Models'}
                </button>
              </div>
              <AnimatePresence>
                {validationStatus === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> Invalid API Key or connection error.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

             {/* Model Input */}
             <div className="mb-8">
               <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="model-name">
                 Active Model
               </label>
               {modelList.length > 0 ? (
                 <select
                   id="model-name"
                   value={modelInput}
                   onChange={(e) => setModelInput(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-white focus:outline-none focus:border-accent transition-all duration-200 appearance-none cursor-pointer"
                 >
                   {modelList.map(model => (
                     <option key={model} value={model} className="bg-gray-900 text-white">
                       {model}
                     </option>
                   ))}
                 </select>
               ) : (
                 <div className="relative">
                   <input
                     id="model-name"
                     type="text"
                     value={modelInput}
                     onChange={(e) => setModelInput(e.target.value)}
                     placeholder={selectedProvider.defaultModel}
                     className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-all duration-200"
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                     <span className="text-[10px] text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Manual Entry</span>
                   </div>
                 </div>
               )}
              <p className="mt-2 text-xs text-gray-500">
                Current selected: <span className="text-gray-300 font-mono italic">{modelInput}</span>
              </p>
            </div>

            {/* Raw Model List Debug (New) */}
            {modelList.length > 0 && (
              <div className="mt-6 pt-6 border-t border-glass-border">
                <button
                  onClick={() => setShowRawModels(!showRawModels)}
                  className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${showRawModels ? 'rotate-180' : ''} transition-transform`} />
                  {showRawModels ? 'Hide Raw Model List' : 'Debug: Show Raw Model List'}
                </button>
                <AnimatePresence>
                  {showRawModels && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="p-4 rounded-xl bg-black/40 border border-glass-border max-h-60 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1">
                        {modelList.map((m, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-accent ring-1 ring-accent/20 px-1 rounded">{i+1}</span>
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[10px] text-gray-500 italic">
                        Use these exact IDs for manual configuration if needed.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* Brand Strategy Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Brand Strategy & Language</h2>
          </div>
          <div className="p-8 rounded-2xl bg-glass border border-glass-border backdrop-blur-xl">
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="brand-voice">
                Brand Voice & Knowledge
              </label>
              <textarea
                id="brand-voice"
                value={brandVoiceInput}
                onChange={(e) => setBrandVoiceInput(e.target.value)}
                rows={4}
                placeholder="E.g., Casual but expert, focuses on developer tools, startup background..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-all duration-200 resize-none font-sans leading-relaxed"
              />
              <p className="mt-2 text-xs text-gray-500 italic">
                This context will be used to ground all AI agents in your specific tone and background.
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="target-lang">
                Target Language
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  id="target-lang"
                  type="text"
                  value={targetLanguageInput}
                  onChange={(e) => setTargetLanguageInput(e.target.value)}
                  placeholder="English, Turkish, German, etc."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Visual AI Section (New) */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Visual AI (Beta)</h2>
          </div>
          <div className="p-8 rounded-2xl bg-glass border border-glass-border backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white font-medium">Automatic Social Media Assets</h3>
                <p className="text-sm text-gray-500">Generate tailor-made images for your posts using Gemini.</p>
              </div>
              <button
                onClick={() => setImageGenEnabledInput(!imageGenEnabledInput)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  imageGenEnabledInput ? 'bg-accent' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    imageGenEnabledInput ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {imageGenEnabledInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6 pt-4 border-t border-glass-border"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="image-model">
                      Image Model
                    </label>
                    <button
                      onClick={() => setManualImageModel(!manualImageModel)}
                      className="text-[10px] font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
                    >
                      {manualImageModel ? 'Use Dropdown' : 'Manual Entry'}
                    </button>
                  </div>
                  {(settings.provider === 'gemini' && modelList.length > 0 && !manualImageModel) ? (
                    <select
                      id="image-model"
                      value={imageModelInput}
                      onChange={(e) => setImageModelInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-white focus:outline-none focus:border-accent transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {/* Filter for models that likely support image gen (Imagen models) */}
                      {modelList.filter(m => m.toLowerCase().includes('imagen') || m.toLowerCase().includes('generate') || m.toLowerCase().includes('image')).map(model => (
                        <option key={model} value={model} className="bg-gray-900 text-white">
                          {model}
                        </option>
                      ))}
                      {/* Fallback to show all models if no Imagen found */}
                      {modelList.filter(m => m.toLowerCase().includes('imagen') || m.toLowerCase().includes('generate') || m.toLowerCase().includes('image')).length === 0 && 
                        modelList.map(model => (
                          <option key={model} value={model} className="bg-gray-900 text-white">
                            {model}
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <input
                      id="image-model"
                      type="text"
                      value={imageModelInput}
                      onChange={(e) => setImageModelInput(e.target.value)}
                      placeholder="imagen-4.0-fast-generate-001"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-all duration-200"
                    />
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Recommended: <code className="bg-white/5 px-1 rounded">imagen-4.0-fast-generate-001</code>
                  </p>
                </div>

                <div className="pt-4 border-t border-glass-border">
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Visual Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-white/5 border border-glass-border">
                    <button
                      onClick={() => setImageModeInput('platform-specific')}
                      className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        imageModeInput === 'platform-specific'
                          ? 'bg-accent text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      Each Platform Unique
                    </button>
                    <button
                      onClick={() => setImageModeInput('unified')}
                      className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        imageModeInput === 'unified'
                          ? 'bg-accent text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      Single Unified Image
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 italic">
                    {imageModeInput === 'unified' 
                      ? "One high-quality visual will be created for the entire project, ensuring brand consistency."
                      : "Each social post will get its own AI-designed visual based on its specific context."}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Action Button */}
        <div className="sticky bottom-8 z-20 mt-12">
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute -top-16 left-0 right-0 flex justify-center"
              >
                <div className="bg-emerald-500 text-white px-6 py-2 rounded-full shadow-lg shadow-emerald-500/20 font-bold flex items-center gap-2 border border-emerald-400/50">
                  <CheckCircle2 className="w-5 h-5" /> All settings saved successfully!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(!settings.apiKey && apiKeyInput === '') && (
            <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200 font-medium">
                No API key set. You&apos;ll need to add your API key to use the AI features.
              </p>
            </div>
          )}
          <button
            onClick={handleSave}
            className="w-full py-4 px-8 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-lg shadow-xl shadow-accent/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
          >
            Save All Settings
          </button>
        </div>

        {/* Info Box */}
        <section className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm border-dashed">
          <h3 className="text-lg font-bold text-white mb-3">Privacy & Zero-SaaS Promise</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            This application supports multiple AI providers. Choose your preferred provider and enter your API key
            to enable AI-powered content repurposing. Your API keys and Brand Knowledge are stored **locally**
            in your browser and never sent to any server other than the respective AI provider&apos;s API.
          </p>
        </section>
      </div>
    </div>
  );
}

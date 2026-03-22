export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AIClient {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  generateImage?(prompt: string, model?: string): Promise<string>;
  listModels(): Promise<string[]>;
}

export function createClient(provider: string, apiKey: string, model: string): AIClient {
  const normalizedProvider = provider.toLowerCase();

  switch (normalizedProvider) {
    case 'groq':
      return createGroqClient(apiKey, model);
    case 'gemini':
      return createGeminiClient(apiKey, model);
    case 'openrouter':
      return createOpenRouterClient(apiKey, model);
    case 'deepseek':
      return createDeepSeekClient(apiKey, model);
    default:
      throw new Error(`Unsupported provider: ${provider}. Supported: groq, gemini, openrouter, deepseek`);
  }
}

function createGroqClient(apiKey: string, model: string): AIClient {
  const chatEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const modelsEndpoint = 'https://api.groq.com/openai/v1/models';

  return {
    async chat(messages, options = {}) {
      const response = await fetchWithTimeout(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
        }),
      });

      return handleOpenAIResponse(response);
    },
    async listModels() {
      const response = await fetchWithTimeout(modelsEndpoint, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!response.ok) throw new Error('Invalid Groq API Key');
      const data = await response.json();
      return (data.data || []).map((m: { id: string }) => m.id);
    }
  };
}

function createGeminiClient(apiKey: string, model: string): AIClient {
  const chatEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const modelsEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  return {
    async chat(messages, options = {}) {
      const systemMessage = messages.find(m => m.role === 'system');
      const chatMessages = messages.filter(m => m.role !== 'system');

      const contents = chatMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      interface GeminiRequestBody {
        contents: { role: string; parts: { text: string }[] }[];
        systemInstruction?: { parts: { text: string }[] };
        generationConfig?: Record<string, number>;
      }

      const requestBody: GeminiRequestBody = {
        contents,
      };

      if (systemMessage) {
        requestBody.systemInstruction = { parts: [{ text: systemMessage.content }] };
      }

      const generationConfig: Record<string, number> = {};
      if (options.temperature !== undefined) generationConfig.temperature = options.temperature;
      if (options.maxTokens !== undefined) generationConfig.maxOutputTokens = options.maxTokens;
      
      if (Object.keys(generationConfig).length > 0) {
        requestBody.generationConfig = generationConfig;
      }

      const response = await fetchWithTimeout(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      return handleGeminiResponse(response);
    },

    async generateImage(prompt, imageModel) {
      if (!imageModel) {
        throw new Error('No Image Model selected. Please configure it in Settings.');
      }
      const imageEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict?key=${apiKey}`;
      
      console.log(`[AI-Client] Generating image with model: ${imageModel}`);
      
      const response = await fetchWithTimeout(imageEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
          }
        }),
      }, 60000); // Increased timeout for Imagen 3

      if (!response.ok) {
        const errorText = await response.text();
        let errorHint = '';
        try {
          const res = JSON.parse(errorText);
          errorHint = res.error?.message || res.message || errorText;
        } catch {
          errorHint = errorText;
        }
        
        console.error(`[AI-Client] Imagen error: ${response.status}`, errorHint);
        
        if (response.status === 403) {
          throw new Error('403 Forbidden: Your Gemini API key doesn\'t have permission for Imagen (or your region is restricted). Check Google AI Studio for "Imagen" access.');
        }
        if (response.status === 404) {
          throw new Error(`404 Not Found: Model "${imageModel}" is invalid. Please check the Raw Model List in settings.`);
        }

        throw new Error(`Gemini Image Gen failed: ${response.status} - ${errorHint.substring(0, 150)}`);
      }

      const data = await response.json();
      const base64 = data?.predictions?.[0]?.bytesBase64Encoded;
      
      if (!base64) {
        console.error('[AI-Client] No bytes returned from Imagen:', data);
        throw new Error('No image was generated. This could be due to safety filters or account limitations.');
      }

      return `data:image/png;base64,${base64}`;
    },

    async listModels() {
      const response = await fetchWithTimeout(modelsEndpoint, {});
      if (!response.ok) throw new Error('Invalid Gemini API Key');
      const data = await response.json();
      // Log full data for easier debugging of specific model IDs like Imagen
      console.log(`[AI-Client] Fetched ${data.models?.length ?? 0} models from Gemini:`, data.models);
      return (data.models || []).map((m: { name: string }) => m.name.replace('models/', ''));
    }
  };
}

function createOpenRouterClient(apiKey: string, model: string): AIClient {
  const chatEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const modelsEndpoint = 'https://openrouter.ai/api/v1/models';

  return {
    async chat(messages, options = {}) {
      const response = await fetchWithTimeout(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/anomalyco/opencode',
          'X-Title': 'OpenCode AI Client',
        },
        body: JSON.stringify({
          model,
          messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
        }),
      });

      return handleOpenAIResponse(response);
    },
    async listModels() {
      const response = await fetchWithTimeout(modelsEndpoint, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!response.ok) throw new Error('Invalid OpenRouter API Key');
      const data = await response.json();
      return (data.data || []).map((m: { id: string }) => m.id);
    }
  };
}

function createDeepSeekClient(apiKey: string, model: string): AIClient {
  const chatEndpoint = 'https://api.deepseek.com/v1/chat/completions';
  const modelsEndpoint = 'https://api.deepseek.com/models';

  return {
    async chat(messages, options = {}) {
      const response = await fetchWithTimeout(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
        }),
      });

      return handleOpenAIResponse(response);
    },
    async listModels() {
      const response = await fetchWithTimeout(modelsEndpoint, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!response.ok) throw new Error('Invalid DeepSeek API Key');
      const data = await response.json();
      return (data.data || []).map((m: { id: string }) => m.id);
    }
  };
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleOpenAIResponse(response: Response): Promise<string> {
  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(`API Error: ${response.status} - ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || data.error);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid response: missing content');
  }

  return content;
}

async function handleGeminiResponse(response: Response): Promise<string> {
  if (!response.ok) {
    const error = await parseError(response);
    throw new Error(`API Error: ${response.status} - ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || data.error);
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('Invalid response: missing content');
  }

  return content;
}

async function parseError(response: Response): Promise<{ message: string }> {
  try {
    const text = await response.text();
    const data = JSON.parse(text);
    return { message: data.message || data.error?.message || text };
  } catch {
    return { message: response.statusText };
  }
}

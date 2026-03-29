// SIMPLE OPENROUTER API CONFIGURATION
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// WORKING API KEYS (keep these as they are live) - system will rotate through them
const API_KEYS = [
  "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", // Key 1
  // Add more API keys here - they will be used automatically if one fails
  // "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Key 2
  // "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Key 3
];

// Free uncensored AI models - will fallback to next if one fails
const FREE_MODELS = [
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SendMessageOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// SIMPLE REQUEST FUNCTION BASED ON REFERENCE CODE
async function makeRequest(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
  options: SendMessageOptions = {}
): Promise<string> {
  const maxTokens = options.maxTokens ?? 2048; // Increased for better responses
  const temperature = options.temperature ?? 0.8; // Slightly higher for more creative responses

  console.log(`🚀 Sending request to ${model}...`);

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-OpenRouter-Title": "Kera AI",
  };

  // Add HTTP-Referer if in browser environment
  if (typeof window !== 'undefined' && window.location) {
    headers["HTTP-Referer"] = window.location.origin;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
    console.error(`❌ API Error:`, errorMsg);

    // Handle specific error types
    if (response.status === 429) {
      if (errorData.error?.metadata?.raw?.includes("rate-limited upstream")) {
        throw new Error("RATE_LIMIT_UPSTREAM: The AI model is temporarily busy. Please try again in a few minutes.");
      } else {
        throw new Error("RATE_LIMIT: Too many requests. Please wait a moment before trying again.");
      }
    } else if (response.status === 402) {
      throw new Error("NO_CREDITS: This model requires a paid account or available credits. The free tier may have reached its limit.");
    } else if (response.status === 403) {
      if (errorMsg.includes("Key limit exceeded")) {
        throw new Error("API_KEY_LIMIT: The free API usage limit has been reached. Please try again later or consider upgrading to a paid plan.");
      } else {
        throw new Error("API_FORBIDDEN: Access denied. Please check your API key.");
      }
    } else if (response.status === 404) {
      throw new Error("MODEL_NOT_FOUND: The requested AI model is not available. This endpoint may not exist on OpenRouter.");
    } else {
      throw new Error(`API_FAILED: ${errorMsg}`);
    }
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("API_FAILED: No response content");
  }

  console.log(`✅ Success! Response received.`);
  return content;
}

// MAIN FUNCTION - SMART API KEY SWITCHING + MODEL FALLBACK
export async function sendMessage(
  messages: ChatMessage[],
  options: SendMessageOptions = {}
): Promise<string> {
  // Check if API keys are configured
  if (API_KEYS.length === 0 || !API_KEYS[0]) {
    throw new Error("API_NOT_CONFIGURED: No API keys found");
  }

  const activeKeys = API_KEYS.filter(k => k && k.trim()); // Only use non-empty keys
  
  if (activeKeys.length === 0) {
    throw new Error("API_NOT_CONFIGURED: No valid API keys found");
  }

  let lastError: Error | null = null;

  // Try each model
  for (let modelIdx = 0; modelIdx < FREE_MODELS.length; modelIdx++) {
    const model = FREE_MODELS[modelIdx];
    
    // Try each API key when a non-rate-limit error occurs
    for (let keyIdx = 0; keyIdx < activeKeys.length; keyIdx++) {
      const apiKey = activeKeys[keyIdx];
      let retryCountForRateLimit = 0;
      const maxRetriesForRateLimit = 3;

      // If this is a rate limit error, keep retrying SAME API key + model
      while (retryCountForRateLimit < maxRetriesForRateLimit) {
        try {
          const attemptInfo = retryCountForRateLimit > 0 
            ? ` (🔄 Retry ${retryCountForRateLimit}/${maxRetriesForRateLimit})` 
            : "";
          console.log(`🔑 Key ${keyIdx + 1}/${activeKeys.length} | 🤖 Model ${modelIdx + 1}/${FREE_MODELS.length}: ${model}${attemptInfo}`);
          
          const result = await makeRequest(messages, apiKey, model, options);
          return result;
        } catch (error: unknown) {
          const err = error as Error;
          console.warn(`⚠️ Error:`, err.message);
          lastError = err;

          // If it's a RATE LIMIT error (wait 15-30 mins type) - retry SAME API + model
          if (err.message.includes("RATE_LIMIT_UPSTREAM")) {
            retryCountForRateLimit++;
            if (retryCountForRateLimit < maxRetriesForRateLimit) {
              // Exponential backoff: 2s, 4s, 8s
              const delay = 2000 * Math.pow(2, retryCountForRateLimit - 1);
              console.log(`⏱️ Rate limit wait error - retrying same API in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue; // Retry same API + model
            }
          }

          // For ANY other error - switch to next API key
          console.log(`🔄 Switching to next API key...`);
          break; // Break retry loop, go to next API key
        }
      }
    }

    // If all API keys failed for this model, try next model
    if (modelIdx < FREE_MODELS.length - 1) {
      console.log(`🔄 All API keys failed for this model. Trying next model...`);
    }
  }

  // All models and keys exhausted
  throw lastError || new Error("API_FAILED: All API keys and models exhausted. Please try again later.");
}
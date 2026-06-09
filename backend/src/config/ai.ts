import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export const getAIClient = (): Anthropic | null => {
  if (process.env.ANTHROPIC_API_KEY) {
    if (!anthropicClient) {
      anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return anthropicClient;
  }
  return null; // Signals mock mode
};

export const hasAI = () => Boolean(process.env.ANTHROPIC_API_KEY);

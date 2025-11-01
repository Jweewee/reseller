import { useState, useCallback } from 'react';
import OpenAI from 'openai';
import type { ConversationState } from '../types';
import { getStatePrompt } from '../utils/conversationEngine';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface UseOpenAIProps {
  onResponse: (response: string) => void;
  onError: (error: string) => void;
}

export const useOpenAI = ({ onResponse, onError }: UseOpenAIProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const generateResponse = useCallback(async (
    userMessage: string,
    currentState: ConversationState,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: any
  ) => {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      onError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
      return;
    }

    setIsLoading(true);

    try {
      const systemPrompt = getStatePrompt(currentState, context);

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `${systemPrompt}

IMPORTANT GUIDELINES:
- Keep responses conversational and friendly
- Use emojis sparingly but effectively (✓, ⭐, 💡, ⚠️)
- Ask for one piece of information at a time
- Provide clear examples for format requirements
- Validate user input and give helpful error messages
- If user input is unclear, ask for clarification
- Stay in character as a Tuas Power customer service agent
- Don't make up information not provided in the context
- Always be helpful and patient with customers

Current conversation state: ${currentState}
${context ? `Additional context: ${JSON.stringify(context)}` : ''}`
        },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content;

      if (response) {
        onResponse(response);
      } else {
        onError('No response generated. Please try again.');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          onError('Invalid API key. Please check your OpenAI API key configuration.');
        } else if (error.message.includes('quota')) {
          onError('API quota exceeded. Please check your OpenAI account usage.');
        } else if (error.message.includes('rate limit')) {
          onError('Rate limit reached. Please wait a moment and try again.');
        } else {
          onError(`Error generating response: ${error.message}`);
        }
      } else {
        onError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [onResponse, onError]);

  return {
    generateResponse,
    isLoading
  };
};
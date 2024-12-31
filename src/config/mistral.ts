import MistralClient from '@mistralai/mistralai';

const client = new MistralClient('1iEnyMX34FjSYQ9WTRcZgxaYKlUXURxi');

export const generatePollSuggestions = async (question: string) => {
  const response = await client.chat({
    model: 'mistral-tiny',
    messages: [{
      role: 'user',
      content: `Generate 3 relevant options for a poll question: "${question}"the answers should be short and funny`
    }]
  });
  
  return response.choices[0].message.content
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, ''));
};
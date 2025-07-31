export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Claude Sonnet 4',
    description: 'Anthropic\'s most advanced model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Claude Sonnet 4 (Reasoning)',
    description: 'Claude Sonnet 4 with extended thinking capabilities',
  },
];

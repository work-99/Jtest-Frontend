import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  connectedServices: {
    gmail: boolean;
    hubspot: boolean;
  };
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  setConnectedServices: (services: Partial<ChatState['connectedServices']>) => void;
}

export const useStore = create<ChatState>((set: any) => ({
  messages: [],
  connectedServices: {
    gmail: false,
    hubspot: false
  },
  addMessage: (message: Omit<Message, 'timestamp'>) =>
    set((state: ChatState) => ({
      messages: [...state.messages, { ...message, timestamp: new Date() }]
    })),
  setConnectedServices: (services: Partial<ChatState['connectedServices']>) =>
    set((state: ChatState) => ({
      connectedServices: { ...state.connectedServices, ...services }
    })),
}));
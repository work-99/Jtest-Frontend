import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatState {
  messages: Message[];
  connectedServices: {
    gmail: boolean;
    calendar: boolean;
    hubspot: boolean;
  };
  addMessage: (message: Message) => void;
  setConnectedServices: (services: Partial<ChatState['connectedServices']>) => void;
}

export const useStore = create<ChatState>((set) => ({
  messages: [],
  connectedServices: {
    gmail: false,
    calendar: false,
    hubspot: false
  },
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, { ...message, timestamp: new Date() }] 
    })),
  setConnectedServices: (services) => 
    set((state) => ({ 
      connectedServices: { ...state.connectedServices, ...services } 
    })),
}));
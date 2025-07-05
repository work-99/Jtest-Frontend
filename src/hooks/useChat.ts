// hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    toolCalls?: any[];
    actionRequired?: boolean;
    context?: string;
  };
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      const response = await chatAPI.sendMessage(content, state.sessionId || undefined);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.text || response.data.message,
        timestamp: new Date(),
        metadata: {
          toolCalls: response.data.toolCalls,
          actionRequired: response.data.actionRequired,
          context: response.data.context
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        sessionId: response.data.sessionId || prev.sessionId
      }));

      // Show notification for action required
      if (response.data.actionRequired) {
        toast.success('Action required! Check the task management panel.');
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        metadata: {
          context: 'Error occurred'
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        error: error.response?.data?.message || 'Failed to send message'
      }));

      toast.error('Failed to send message');
    }
  }, [state.sessionId]);

  const loadHistory = useCallback(async (sessionId?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await chatAPI.getHistory(sessionId);
      const messages = response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      setState(prev => ({
        ...prev,
        messages,
        sessionId: sessionId || prev.sessionId,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load chat history'
      }));
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      sessionId: null
    }));
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, systemMessage]
    }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sessionId: state.sessionId,
    sendMessage,
    loadHistory,
    clearMessages,
    addSystemMessage
  };
};
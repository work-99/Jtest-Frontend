// hooks/useChat.ts
import { useState, useCallback, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { webSocketService, WebSocketMessage, TaskUpdate, ProactiveUpdate, Notification } from '../services/websocket.service';
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
  isConnected: boolean;
}

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
    isConnected: false
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      webSocketService.connect(token);
    }

    // Set up WebSocket event handlers
    const unsubscribeMessage = webSocketService.onMessage((wsMessage: WebSocketMessage) => {
      const message: Message = {
        id: Date.now().toString(),
        role: wsMessage.role,
        content: wsMessage.content,
        timestamp: new Date(wsMessage.timestamp),
        metadata: {
          toolCalls: wsMessage.toolCalls,
          actionRequired: wsMessage.actionRequired
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
        isLoading: false
      }));
    });

    const unsubscribeTaskUpdate = webSocketService.onTaskUpdate((task: TaskUpdate) => {
      toast.success(`Task updated: ${task.type} - ${task.status}`);
    });

    const unsubscribeProactiveUpdate = webSocketService.onProactiveUpdate((update: ProactiveUpdate) => {
      if (update.actionRequired) {
        toast.success('Proactive action taken! Check tasks for details.');
      }
      
      // Add proactive update as a system message
      const message: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `Proactive action: ${update.response}`,
        timestamp: new Date(update.timestamp),
        metadata: {
          toolCalls: update.toolCalls,
          actionRequired: update.actionRequired
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    });

    const unsubscribeNotification = webSocketService.onNotification((notification: Notification) => {
      switch (notification.type) {
        case 'success':
          toast.success(notification.message);
          break;
        case 'error':
          toast.error(notification.message);
          break;
        case 'warning':
          toast.error(notification.message); // react-hot-toast doesn't have warning, use error
          break;
        case 'info':
          toast(notification.message); // Use default toast for info
          break;
        default:
          toast(notification.message);
      }
    });

    const unsubscribeConnection = webSocketService.onConnectionChange((connected: boolean) => {
      setState(prev => ({ ...prev, isConnected: connected }));
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMessage();
      unsubscribeTaskUpdate();
      unsubscribeProactiveUpdate();
      unsubscribeNotification();
      unsubscribeConnection();
      webSocketService.disconnect();
    };
  }, []);

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
      // Send via REST API for immediate response
      const response = await chatAPI.sendMessage(content, state.sessionId || undefined);
      
      console.log('Chat API response:', response);
      console.log('Response data:', response.data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.text || response.data.message || 'No response received',
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

      console.log('Updated state with sessionId:', response.data.sessionId);

      // Show notification for action required
      if (response.data.actionRequired) {
        toast.success('Action required! Check the task management panel.');
      }

      // Also send via WebSocket for real-time updates
      if (webSocketService.isConnectedToServer()) {
        webSocketService.sendChatMessage(content);
      }

    } catch (error: any) {
      console.error('Chat error:', error);

      let errorMsg = 'Failed to send message';
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
        metadata: {
          context: 'Error occurred'
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        error: errorMsg
      }));

      toast.error(errorMsg);
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
    isConnected: state.isConnected,
    sendMessage,
    loadHistory,
    clearMessages,
    addSystemMessage
  };
};
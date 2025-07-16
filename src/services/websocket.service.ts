import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: any[];
  actionRequired?: boolean;
}

export interface TaskUpdate {
  id: number;
  type: string;
  status: string;
  data: any;
  result?: any;
  timestamp: Date;
}

export interface ProactiveUpdate {
  eventType: string;
  eventData: any;
  response: string;
  actionRequired: boolean;
  toolCalls: any[];
  timestamp: Date;
}

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event handlers
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private taskUpdateHandlers: ((task: TaskUpdate) => void)[] = [];
  private proactiveUpdateHandlers: ((update: ProactiveUpdate) => void)[] = [];
  private notificationHandlers: ((notification: Notification) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];

  connect(token: string) {
    if (this.socket && this.isConnected) {
      return;
    }

    const serverUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers(true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.notifyConnectionHandlers(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('chat_message', (data: WebSocketMessage) => {
      console.log('Received chat message:', data);
      this.notifyMessageHandlers(data);
    });

    this.socket.on('task_update', (data: TaskUpdate) => {
      console.log('Received task update:', data);
      this.notifyTaskUpdateHandlers(data);
    });

    this.socket.on('proactive_update', (data: ProactiveUpdate) => {
      console.log('Received proactive update:', data);
      this.notifyProactiveUpdateHandlers(data);
    });

    this.socket.on('notification', (data: Notification) => {
      console.log('Received notification:', data);
      this.notifyNotificationHandlers(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send methods
  sendChatMessage(message: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat_message', { content: message });
    }
  }

  sendTaskUpdate(task: TaskUpdate) {
    if (this.socket && this.isConnected) {
      this.socket.emit('task_update', task);
    }
  }

  // Event handler registration
  onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onTaskUpdate(handler: (task: TaskUpdate) => void) {
    this.taskUpdateHandlers.push(handler);
    return () => {
      const index = this.taskUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.taskUpdateHandlers.splice(index, 1);
      }
    };
  }

  onProactiveUpdate(handler: (update: ProactiveUpdate) => void) {
    this.proactiveUpdateHandlers.push(handler);
    return () => {
      const index = this.proactiveUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.proactiveUpdateHandlers.splice(index, 1);
      }
    };
  }

  onNotification(handler: (notification: Notification) => void) {
    this.notificationHandlers.push(handler);
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  // Notify handlers
  private notifyMessageHandlers(message: WebSocketMessage) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyTaskUpdateHandlers(task: TaskUpdate) {
    this.taskUpdateHandlers.forEach(handler => handler(task));
  }

  private notifyProactiveUpdateHandlers(update: ProactiveUpdate) {
    this.proactiveUpdateHandlers.forEach(handler => handler(update));
  }

  private notifyNotificationHandlers(notification: Notification) {
    this.notificationHandlers.forEach(handler => handler(notification));
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  // Status methods
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.isConnected) return 'connected';
    return 'connecting';
  }
}

export const webSocketService = new WebSocketService(); 
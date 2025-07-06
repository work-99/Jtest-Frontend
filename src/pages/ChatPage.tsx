// pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Fab,
  Badge
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import ConnectionStatus from '../components/ui/ConnectionStatus';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

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

interface Task {
  id: number;
  type: string;
  status: string;
  data: any;
  created_at: Date;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, isLoading, error } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contextData, setContextData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const message = inputValue;
    setInputValue('');
    
    try {
      await sendMessage(message);
      
      // Check for action required
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.metadata?.actionRequired) {
        toast.success('Action required! Check the task management panel.');
        loadTasks();
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'assistant':
        return <AIIcon />;
      case 'system':
        return <InfoIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getMessageColor = (role: string) => {
    switch (role) {
      case 'assistant':
        return 'primary';
      case 'system':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.metadata?.toolCalls) {
      return (
        <Box>
          <ReactMarkdown>{message.content}</ReactMarkdown>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Actions performed:
            </Typography>
            {message.metadata.toolCalls.map((toolCall: any, index: number) => (
              <Chip
                key={index}
                label={`${toolCall.function.name} executed`}
                size="small"
                color="success"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        </Box>
      );
    }

    return <ReactMarkdown>{message.content}</ReactMarkdown>;
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'failed':
        return <ErrorIcon />;
      case 'in_progress':
        return <CircularProgress size={16} />;
      default:
        return <ScheduleIcon />;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AIIcon color="primary" />
            <Typography variant="h6">AI Assistant</Typography>
            <Chip
              label={isLoading ? 'Thinking...' : 'Online'}
              color={isLoading ? 'warning' : 'success'}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Task Management">
              <IconButton onClick={() => setShowTasks(true)}>
                <Badge badgeContent={tasks.filter(t => t.status === 'pending').length} color="error">
                  <ScheduleIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Context & Settings">
              <IconButton onClick={() => setShowContext(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List sx={{ pb: 0 }}>
          {messages.map((message, index) => (
            <ListItem
              key={message.id || index}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                mb: 2,
                p: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: `${getMessageColor(message.role)}.main`,
                    width: 32,
                    height: 32
                  }}
                >
                  {getMessageIcon(message.role)}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </Typography>
                {message.metadata?.actionRequired && (
                  <Chip
                    label="Action Required"
                    color="warning"
                    size="small"
                    icon={<ScheduleIcon />}
                  />
                )}
              </Box>
              <Paper
                sx={{
                  p: 2,
                  ml: 4,
                  maxWidth: '80%',
                  bgcolor: message.role === 'assistant' ? 'grey.50' : 'primary.50'
                }}
              >
                {renderMessageContent(message)}
              </Paper>
            </ListItem>
          ))}
        </List>
        
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              AI is thinking...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your clients, schedule appointments, or manage tasks..."
            variant="outlined"
            size="small"
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            color="primary"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Context Dialog */}
      <Dialog open={showContext} onClose={() => setShowContext(false)} maxWidth="md" fullWidth>
        <DialogTitle>Context & Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Available Context
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip
                      label="Gmail Integration"
                      color="success"
                      icon={<EmailIcon />}
                    />
                    <Chip
                      label="HubSpot CRM"
                      color="success"
                      icon={<BusinessIcon />}
                    />
                    <Chip
                      label="Google Calendar"
                      color="warning"
                      icon={<ScheduleIcon />}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Agent Capabilities
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Email composition and sending" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Appointment scheduling" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Contact management" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Task automation" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Typography variant="h6" gutterBottom>
                Connected Services
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ConnectionStatus service="gmail" />
                <ConnectionStatus service="hubspot" />
              </Box>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => setShowEmailModal(true)}
                  fullWidth
                >
                  Send Email
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowContactModal(true)}
                  fullWidth
                >
                  Add Contact
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContext(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Tasks Dialog */}
      <Dialog open={showTasks} onClose={() => setShowTasks(false)} maxWidth="md" fullWidth>
        <DialogTitle>Task Management</DialogTitle>
        <DialogContent>
          <List>
            {tasks.map((task) => (
              <ListItem
                key={task.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {task.type.replace(/_/g, ' ').toUpperCase()}
                      <Chip
                        label={task.status}
                        color={getTaskStatusColor(task.status) as any}
                        size="small"
                        icon={getTaskStatusIcon(task.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        {JSON.stringify(task.data, null, 2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {tasks.length === 0 && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No tasks found
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTasks(false)}>Close</Button>
          <Button onClick={loadTasks} variant="outlined">Refresh</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatPage;
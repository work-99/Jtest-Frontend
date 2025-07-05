import { Avatar, Box, Typography } from '@mui/material';
import { marked } from 'marked';
import { Message } from '../../types/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const bgColor = isAssistant ? 'bg-blue-50' : 'bg-white';
  const align = isAssistant ? 'flex-start' : 'flex-end';
  const avatar = isAssistant ? 'A' : 'Y';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: align,
        mb: 2,
        px: 2
      }}
    >
      {isAssistant && (
        <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
          {avatar}
        </Avatar>
      )}
      
      <Box
        sx={{
          maxWidth: '80%',
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          backgroundColor: bgColor,
        }}
      >
        <Typography 
          component="div" 
          sx={{ 
            '& pre': { 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              overflowX: 'auto'
            },
            '& code': {
              fontFamily: 'monospace'
            }
          }}
          dangerouslySetInnerHTML={{ 
            __html: marked.parse(message.content) 
          }}
        />
      </Box>
      
      {!isAssistant && (
        <Avatar sx={{ ml: 1, bgcolor: 'grey.500' }}>
          {avatar}
        </Avatar>
      )}
    </Box>
  );
}
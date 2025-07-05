import React from 'react';
import { styled, keyframes } from '@mui/system';
import { Box } from '@mui/material';

// Animation for the typing dots
const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
`;

const Dot = styled('div')<{ delay: string }>(({ theme, delay }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.text.secondary,
  display: 'inline-block',
  margin: '0 2px',
  animation: `${bounce} 1.4s infinite ease-in-out`,
  animationDelay: delay,
}));

interface TypingIndicatorProps {
  /**
   * Optional text to display before the dots
   */
  text?: string;
  /**
   * Size of the dots (small, medium, large)
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Color of the dots
   * @default 'text.secondary'
   */
  color?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  text = 'AI is thinking',
  size = 'medium',
  color,
}) => {
  const dotSize = {
    small: 6,
    medium: 8,
    large: 10,
  }[size];

  const dotMargin = {
    small: '0 1px',
    medium: '0 2px',
    large: '0 3px',
  }[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: 1,
        color: color || 'text.secondary',
        fontSize: '0.875rem',
      }}
    >
      {text && <span>{text}</span>}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          height: dotSize,
        }}
      >
        <Dot
          delay="0s"
          sx={{
            width: dotSize,
            height: dotSize,
            margin: dotMargin,
            backgroundColor: color || 'text.secondary',
          }}
        />
        <Dot
          delay="0.2s"
          sx={{
            width: dotSize,
            height: dotSize,
            margin: dotMargin,
            backgroundColor: color || 'text.secondary',
          }}
        />
        <Dot
          delay="0.4s"
          sx={{
            width: dotSize,
            height: dotSize,
            margin: dotMargin,
            backgroundColor: color || 'text.secondary',
          }}
        />
      </Box>
    </Box>
  );
};

export default TypingIndicator;
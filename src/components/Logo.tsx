import React from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', color }) => {
  const sizes = {
    small: { fontSize: 24, spacing: 0.5 },
    medium: { fontSize: 32, spacing: 1 },
    large: { fontSize: 48, spacing: 1.5 }
  };

  return (
    <Box 
      display="flex" 
      alignItems="center"
      gap={sizes[size].spacing}
      sx={{ color }}
    >
      <Box
        component="span"
        sx={{
          width: sizes[size].fontSize,
          height: sizes[size].fontSize,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        AI
      </Box>
      <Typography 
        variant="h6" 
        component="span"
        sx={{ 
          fontWeight: 700,
          fontSize: sizes[size].fontSize * 0.75,
          lineHeight: 1 
        }}
      >
        FinAdvisor
      </Typography>
    </Box>
  );
};

export default Logo;
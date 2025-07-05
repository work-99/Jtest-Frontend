import { 
    TextField, 
    IconButton, 
    InputAdornment, 
    Box 
  } from '@mui/material';
  import SendIcon from '@mui/icons-material/Send';
  
  interface MessageInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e?: React.FormEvent) => void;
    disabled?: boolean;
  }
  
  export default function MessageInput({
    value,
    onChange,
    onSubmit,
    disabled
  }: MessageInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    };
  
    return (
      <Box component="form" onSubmit={onSubmit}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about clients or request actions..."
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  type="submit" 
                  disabled={!value.trim() || disabled}
                >
                  <SendIcon color={disabled ? 'disabled' : 'primary'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    );
  }
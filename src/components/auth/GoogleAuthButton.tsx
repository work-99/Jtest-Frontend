import { Button } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useGoogleAuth } from '../../hooks/useOAuth';

export default function GoogleAuthButton() {
  const { isAuthenticated, handleAuth } = useGoogleAuth();

  return (
    <Button
      variant="contained"
      startIcon={<Google />}
      onClick={handleAuth}
      color={isAuthenticated ? 'success' : 'primary'}
    >
      {isAuthenticated ? 'Connected to Google' : 'Connect Google Account'}
    </Button>
  );
}
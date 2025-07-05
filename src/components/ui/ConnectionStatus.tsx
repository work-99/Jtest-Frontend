import { styled } from '@mui/material/styles';
import { Badge } from '@mui/material';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: (props: { status: boolean }) => 
      props.status ? theme.palette.success.main : theme.palette.error.main,
    color: (props: { status: boolean }) => 
      props.status ? theme.palette.success.main : theme.palette.error.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

interface ConnectionStatusProps {
  service: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ service }) => {
  // In a real app, you would check the actual connection status
  const isConnected = {
    gmail: true,
    calendar: true,
    hubspot: false
  }[service];

  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
      color={isConnected ? 'success' : 'error'}
    />
  );
};

export default ConnectionStatus;
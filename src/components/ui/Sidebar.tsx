import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Avatar,
  Typography,
  IconButton,
  Collapse,
  Badge
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Email,
  CalendarToday,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  Notifications,
  Chat,
  Hub,
  Workspaces
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import HubspotAuthButton from '../../components/auth/HubspotAuthButton';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import ConnectionStatus from '../../components/ui/ConnectionStatus';

const drawerWidth = 240;

const SidebarContainer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));


interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, activeView, setActiveView }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [openIntegrations, setOpenIntegrations] = useState(true);
  const [openNotifications, setOpenNotifications] = useState(false);

  const handleIntegrationClick = () => {
    setOpenIntegrations(!openIntegrations);
  };

  const handleNotificationClick = () => {
    setOpenNotifications(!openNotifications);
  };

  const mainMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, view: 'dashboard' },
    { text: 'Chat', icon: <Chat />, view: 'chat' },
    { text: 'Clients', icon: <People />, view: 'clients' },
  ];

  const integrationMenuItems = [
    { text: 'Gmail', icon: <Email />, view: 'gmail' },
    { text: 'Calendar', icon: <CalendarToday />, view: 'calendar' },
    { text: 'HubSpot', icon: <Hub />, view: 'hubspot' },
  ];

  return (
    <SidebarContainer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose}>
          {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider />

      {/* User Profile Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          src={user?.picture} 
          alt={user?.name}
          sx={{ width: 48, height: 48 }}
        >
          {user?.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" noWrap>
            {user?.name || 'Financial Advisor'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>
      <Divider />

      {/* Main Navigation */}
      <List>
        {mainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={activeView === item.view}
              onClick={() => setActiveView(item.view)}
            >
              <ListItemIcon sx={{ color: activeView === item.view ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Notifications Section */}
      <ListItem disablePadding>
        <ListItemButton onClick={handleNotificationClick}>
          <ListItemIcon>
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Notifications" />
          {openNotifications ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={openNotifications} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="Meeting with John at 2PM" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="New message from Sarah" />
          </ListItemButton>
        </List>
      </Collapse>
      <Divider />

      {/* Integrations Section */}
      <ListItem disablePadding>
        <ListItemButton onClick={handleIntegrationClick}>
          <ListItemIcon>
            <Workspaces />
          </ListItemIcon>
          <ListItemText primary="Integrations" />
          {openIntegrations ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={openIntegrations} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {integrationMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={activeView === item.view}
                onClick={() => setActiveView(item.view)}
              >
                <ListItemIcon sx={{ color: activeView === item.view ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                <ConnectionStatus service={item.view} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Integration Connection Buttons */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <GoogleAuthButton />
          <HubspotAuthButton />
        </Box>
      </Collapse>
      <Divider />

      {/* Settings */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={activeView === 'settings'}
            onClick={() => setActiveView('settings')}
          >
            <ListItemIcon sx={{ color: activeView === 'settings' ? 'primary.main' : 'inherit' }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </SidebarContainer>
  );
};

export default Sidebar;
// src/Layout.tsx
import { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './components/ui/Sidebar';
import Header from './components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('chat'); // Default view

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Toolbar /> {/* Spacer for fixed header */}
        {children}
      </Box>
    </Box>
  );
}
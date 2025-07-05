// pages/TasksPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Task {
  id: number;
  type: string;
  status: 'pending' | 'in_progress' | 'waiting_for_response' | 'completed' | 'failed';
  data: any;
  result?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    type: '',
    data: ''
  });

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const taskData = {
        type: newTask.type,
        data: JSON.parse(newTask.data)
      };

      await tasksAPI.createTask(taskData);
      toast.success('Task created successfully');
      setShowCreateDialog(false);
      setNewTask({ type: '', data: '' });
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksAPI.deleteTask(taskId);
      toast.success('Task deleted successfully');
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'schedule_appointment':
        return <CalendarIcon />;
      case 'create_hubspot_contact':
        return <BusinessIcon />;
      case 'send_follow_up_email':
        return <EmailIcon />;
      case 'ai_processing':
        return <AIIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'waiting_for_response':
        return 'info';
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
      case 'waiting_for_response':
        return <PendingIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Paper>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Task Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadTasks}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
              >
                Create Task
              </Button>
            </Box>
          </Box>

          {/* Task Statistics */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {taskStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {taskStats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {taskStats.inProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {taskStats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {taskStats.failed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Task List */}
        <Box sx={{ p: 3 }}>
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
                <ListItemIcon>
                  {getTaskStatusIcon(task.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {task.type.replace(/_/g, ' ').toUpperCase()}
                      <Chip
                        label={task.status}
                        color={getTaskStatusColor(task.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {JSON.stringify(task.data, null, 2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => setShowTaskDetails(task)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Task">
                    <IconButton onClick={() => handleDeleteTask(task.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
            {tasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No tasks found</Typography>
              </Box>
            )}
          </List>
        </Box>
      </Paper>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={newTask.type}
                onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                label="Task Type"
              >
                <MenuItem value="schedule_appointment">Schedule Appointment</MenuItem>
                <MenuItem value="create_hubspot_contact">Create HubSpot Contact</MenuItem>
                <MenuItem value="send_follow_up_email">Send Follow-up Email</MenuItem>
                <MenuItem value="ai_processing">AI Processing</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Task Data (JSON)"
              value={newTask.data}
              onChange={(e) => setNewTask(prev => ({ ...prev, data: e.target.value }))}
              placeholder='{"key": "value"}'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={!!showTaskDetails} onClose={() => setShowTaskDetails(null)} maxWidth="md" fullWidth>
        {showTaskDetails && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getTaskIcon(showTaskDetails.type)}
                Task Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>Type:</strong> {showTaskDetails.type}</Typography>
                    <Typography><strong>Status:</strong> {showTaskDetails.status}</Typography>
                    <Typography><strong>Created:</strong> {format(new Date(showTaskDetails.created_at), 'PPpp')}</Typography>
                    <Typography><strong>Updated:</strong> {format(new Date(showTaskDetails.updated_at), 'PPpp')}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Data</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={JSON.stringify(showTaskDetails.data, null, 2)}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                {showTaskDetails.result && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Result</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={JSON.stringify(showTaskDetails.result, null, 2)}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                )}
                {showTaskDetails.error_message && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="h6" gutterBottom>Error</Typography>
                      {showTaskDetails.error_message}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowTaskDetails(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TasksPage; 
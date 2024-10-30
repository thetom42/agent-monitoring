import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Memory as MemoryIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
}

type AgentStatus = 'active' | 'idle' | 'error';
type StatusColor = 'success' | 'warning' | 'error' | 'default';

const Sidebar = ({ open }: SidebarProps) => {
  const drawerWidth = 240;

  const agents = [
    { name: 'Agent-1', status: 'active' as AgentStatus },
    { name: 'Agent-2', status: 'idle' as AgentStatus },
    { name: 'Agent-3', status: 'error' as AgentStatus },
  ];

  const getStatusColor = (status: AgentStatus): StatusColor => {
    switch (status) {
      case 'active':
        return 'success';
      case 'idle':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          <ListItem component="button">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem component="button">
            <ListItemIcon>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItem>
          <ListItem component="button">
            <ListItemIcon>
              <MemoryIcon />
            </ListItemIcon>
            <ListItemText primary="Resources" />
          </ListItem>
          <ListItem component="button">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            ACTIVE AGENTS
          </Typography>
        </Box>

        <List>
          {agents.map((agent) => (
            <ListItem key={agent.name} component="button">
              <ListItemIcon>
                <CircleIcon
                  sx={{
                    color: `${getStatusColor(agent.status)}.main`,
                    fontSize: 12,
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={agent.name} />
              <Chip
                label={agent.status}
                size="small"
                color={getStatusColor(agent.status)}
                sx={{ height: 20 }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ px: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            SYSTEM HEALTH
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">CPU Usage</Typography>
              <Typography variant="body2" color="primary">
                45%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Memory</Typography>
              <Typography variant="body2" color="primary">
                2.4GB
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Network</Typography>
              <Typography variant="body2" color="primary">
                125Mb/s
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

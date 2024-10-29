import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const performanceData = [
  { time: '00:00', value: 30 },
  { time: '04:00', value: 45 },
  { time: '08:00', value: 75 },
  { time: '12:00', value: 85 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 40 },
  { time: '24:00', value: 35 },
];

const taskDistribution = [
  { name: 'Completed', value: 65 },
  { name: 'In Progress', value: 25 },
  { name: 'Failed', value: 10 },
];

const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              background: 'rgba(30, 41, 59, 0.95)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Active Agents
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              8
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2 agents pending
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              background: 'rgba(30, 41, 59, 0.95)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tasks Today
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              156
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +23% from yesterday
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              background: 'rgba(30, 41, 59, 0.95)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Success Rate
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              94%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 24 hours
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              background: 'rgba(30, 41, 59, 0.95)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Avg Response Time
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              1.2s
            </Typography>
            <Typography variant="body2" color="text.secondary">
              -0.3s from average
            </Typography>
          </Paper>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              background: 'rgba(30, 41, 59, 0.95)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Performance Overview
            </Typography>
            <ResponsiveContainer>
              <AreaChart
                data={performanceData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Task Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              background: 'rgba(30, 41, 59, 0.95)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Task Distribution
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {taskDistribution.map((entry, index) => (
                <Box
                  key={entry.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: COLORS[index],
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">
                    {entry.name}: {entry.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

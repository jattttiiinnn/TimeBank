import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminFunctions } from '../../config/firebase';
import { useSnackbar } from 'notistack';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

interface AnalyticsData {
  users: {
    total: number;
    newThisWeek: number;
    activeToday: number;
  };
  sessions: {
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  };
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  sessionActivity: Array<{
    date: string;
    completed: number;
    cancelled: number;
  }>;
  userRoles: Array<{
    role: string;
    count: number;
  }>;
  sessionStatus: Array<{
    status: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90, 365 days
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const result = await adminFunctions.getAnalytics({ 
          timeRange: parseInt(timeRange, 10) 
        });
        setAnalyticsData(result.data as AnalyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        enqueueSnackbar('Failed to load analytics', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, enqueueSnackbar]);

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  if (loading || !analyticsData) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const { users, sessions, userGrowth, sessionActivity, userRoles, sessionStatus } = analyticsData;

  // Generate date labels for the selected time range
  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(timeRange, 10));
  const dateRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Format data for charts
  const formattedUserGrowth = dateRange.map(date => {
    const dateStr = format(date, 'MMM dd');
    const dataPoint = userGrowth.find(d => d.date === format(date, 'yyyy-MM-dd')) || { count: 0 };
    return {
      date: dateStr,
      count: dataPoint.count,
    };
  });

  const formattedSessionActivity = dateRange.map(date => {
    const dateStr = format(date, 'MMM dd');
    const dataPoint = sessionActivity.find(d => d.date === format(date, 'yyyy-MM-dd')) || { 
      completed: 0, 
      cancelled: 0 
    };
    return {
      date: dateStr,
      completed: dataPoint.completed,
      cancelled: dataPoint.cancelled,
    };
  });

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Dashboard Analytics</Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            label="Time Range"
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {/* Users Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{users.total.toLocaleString()}</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  +{users.newThisWeek} this week
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {users.activeToday} active today
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessions Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h4">{sessions.total.toLocaleString()}</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  {sessions.completed} completed
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {sessions.cancelled} cancelled • {sessions.upcoming} upcoming
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Roles */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                User Roles
              </Typography>
              <Box height={150}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoles}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="role"
                    >
                      {userRoles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Users"
                    stroke={theme.palette.primary.main}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Session Activity Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Session Activity
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedSessionActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill={theme.palette.success.main} />
                  <Bar dataKey="cancelled" name="Cancelled" fill={theme.palette.error.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Session Status Distribution */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Session Status Distribution
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={sessionStatus}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Sessions" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsTab;

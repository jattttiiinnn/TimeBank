import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, CircularProgress, Typography, useTheme } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../config/firebase';
import MainLayout from '../components/Layout/MainLayout';
import UsersTab from '../components/admin/UsersTab';
import SessionsTab from '../components/admin/SessionsTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const admin = await isAdmin(currentUser);
        setIsUserAdmin(admin);
        
        if (!admin) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!isUserAdmin) {
    return (
      <MainLayout>
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" mt={2}>
            You don't have permission to access the admin dashboard.
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="admin dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="Users" {...a11yProps(1)} />
            <Tab label="Sessions" {...a11yProps(2)} />
            <Tab label="Analytics" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
          <Typography>Welcome to the admin dashboard. Use the tabs above to manage different sections.</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UsersTab />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SessionsTab />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <AnalyticsTab />
        </TabPanel>
      </Box>
    </MainLayout>
  );
};

export default AdminDashboard;

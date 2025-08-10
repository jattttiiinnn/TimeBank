import React from 'react';
import { Button, CircularProgress, Box, Typography, Divider } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';

const LoginButton: React.FC = () => {
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    try {
      const { error } = await signIn();
      if (error) {
        console.error('Login error:', error);
        // Handle error (show toast, etc.)
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 2 }}>
      <Button
        fullWidth
        variant="contained"
        onClick={handleLogin}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
        sx={{
          backgroundColor: '#4285F4',
          color: 'white',
          '&:hover': {
            backgroundColor: '#357ABD',
          },
          mb: 2,
        }}
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </Button>
      
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
          OR
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>
      
      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Button 
            component={RouterLink} 
            to="/signup" 
            variant="text" 
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Sign up
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginButton;

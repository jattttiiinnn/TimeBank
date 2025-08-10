import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import SignupForm from '../components/Auth/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Create Your Account
        </Typography>
        <SignupForm />
      </Box>
    </Container>
  );
};

export default SignupPage;

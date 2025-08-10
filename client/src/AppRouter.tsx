import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import SessionPage from './pages/SessionPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MainLayout from './components/Layout/MainLayout';

// Wrapper component to handle layout and authentication
const RouteWrapper: React.FC<{ children: React.ReactNode; requireAuth?: boolean; adminOnly?: boolean }> = ({
  children,
  requireAuth = true,
  adminOnly = false,
}) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect to home if admin access is required but user is not an admin
  if (adminOnly && (!currentUser || !isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return <MainLayout requireAuth={requireAuth}>{children}</MainLayout>;
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RouteWrapper requireAuth={false}><SessionPage /></RouteWrapper>} />
      <Route path="/signup" element={<RouteWrapper requireAuth={false}><SignupPage /></RouteWrapper>} />
      <Route path="/sessions" element={<RouteWrapper><SessionPage /></RouteWrapper>} />
      
      {/* Session detail route */}
      <Route 
        path="/sessions/:sessionId" 
        element={
          <RouteWrapper>
            <SessionPage />
          </RouteWrapper>
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin/*" 
        element={
          <RouteWrapper adminOnly>
            <AdminDashboard />
          </RouteWrapper>
        } 
      />
      
      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;

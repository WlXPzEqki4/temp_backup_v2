import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Check if user is already logged in
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('Index: Checking user login status', user);
  
  if (user.username) {
    // If user is logged in, redirect to dashboard
    console.log('Index: User is logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, redirect to login
  console.log('Index: User is not logged in, redirecting to login');
  return <Navigate to="/login" replace />;
};

export default Index;

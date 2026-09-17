import React from 'react';
import { Navigate } from 'react-router-dom';

export default function GuestRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/rooms" replace />;
  }

  return children;
}

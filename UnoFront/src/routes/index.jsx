import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Rooms from '../pages/Rooms/Rooms';
import Game from '../pages/Game/Game';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>}/>
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>}/>
        <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>}/>
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

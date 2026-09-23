import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  AuthProvider,
  ProtectedRoute,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  HomePage,
} from '@features/auth';
import './App.css';

/**
 * Root App component.
 * - AuthProvider wraps everything for auth state management
 * - BrowserRouter provides client-side routing
 * - Auth screens are public routes
 * - "/" is protected — redirects to /login if unauthenticated
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <div className="app__card">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

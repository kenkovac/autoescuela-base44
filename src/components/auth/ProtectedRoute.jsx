import React, { useState, useEffect } from "react";
import AuthService from "./AuthService";
import LoginForm from "./LoginForm";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    setIsLoading(true);
    const authenticated = AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  };

  const handleLoginSuccess = (response) => {
    console.log('Login successful, user data:', response);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-bold uppercase">
            VERIFICANDO AUTENTICACIÓN...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return children;
}
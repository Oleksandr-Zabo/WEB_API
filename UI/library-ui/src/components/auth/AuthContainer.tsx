import React from 'react';
import { RegisterForm } from './RegisterForm.tsx';
import '../../styles/auth/AuthContainer.css';

export const AuthContainer: React.FC<{ onAuthSuccess?: () => void }> = ({
  onAuthSuccess,
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <RegisterForm onRegisterSuccess={onAuthSuccess} />
      </div>
    </div>
  );
};

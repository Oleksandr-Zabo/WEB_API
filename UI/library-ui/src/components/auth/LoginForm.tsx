import React, { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useNotification } from '../../hooks/useNotification.ts';
import { userService } from '../../services/userService.ts';
import { isValidEmail, isEmptyString } from '../../utils/validation.util.ts';
import '../../styles/auth/LoginForm.css';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC<{ onLoginSuccess?: () => void; onSignUpClick?: () => void }> = ({ 
  onLoginSuccess,
  onSignUpClick,
}) => {
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (isEmptyString(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (isEmptyString(formData.password)) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof LoginFormData]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        const response = await userService.login({
          email: formData.email,
          password: formData.password,
        });

        login(response.user);
        localStorage.setItem('library-ui.authToken', response.token);
        showNotification('Login successful!', 'success');
        onLoginSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        showNotification(message, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, login, showNotification, onLoginSuccess]
  );

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className={errors.email ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className={errors.password ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          className="signup-button"
          onClick={onSignUpClick}
          disabled={isLoading}
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

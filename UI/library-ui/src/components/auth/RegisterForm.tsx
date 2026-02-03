import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { useNotification } from '../../hooks/useNotification.ts';
import { userService } from '../../services/userService.ts';
import {
  isValidEmail,
  isEmptyString,
  validatePassword,
} from '../../utils/validation.util.ts';
import { CreateUpdateUserRequest } from '../../types/user.types.ts';
import '../../styles/auth/RegisterForm.css';

interface RegisterFormData extends CreateUpdateUserRequest {
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  nickName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterForm: React.FC<{ onRegisterSuccess?: () => void }> = ({
  onRegisterSuccess,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    nickName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (isEmptyString(formData.name)) {
      newErrors.name = 'Name is required';
    }

    if (isEmptyString(formData.nickName)) {
      newErrors.nickName = 'Nick name is required';
    }

    if (isEmptyString(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors.join('; ');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === 'checkbox' ? checked : value;
      setFormData((prev) => ({ ...prev, [name]: newValue }));
      if (errors[name as keyof FormErrors]) {
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
        // Check if user already exists
        const allUsers = await userService.getAllUsers().catch(() => []);
        const existingUser = allUsers.find(
          user => user.email.toLowerCase() === formData.email.toLowerCase()
        );

        if (existingUser) {
          setErrors({ email: 'User with this email already exists' });
          showNotification('User with this email already exists', 'error');
          setIsLoading(false);
          return;
        }

        const { confirmPassword, ...registerData } = formData;
        const newUser = await userService.register(registerData);
        
        // Auto-login after successful registration
        login(newUser);
        localStorage.setItem('library-ui.authToken', 'registered_user_token');
        
        showNotification('Registration successful! Welcome!', 'success');
        
        // Redirect to books page immediately after login
        window.location.href = '/books';
      } catch (error) {
        let message = 'Registration failed';
        
        if (error instanceof Error) {
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') || 
              error.message.includes('conflict')) {
            message = 'User with this email already exists';
            setErrors({ email: message });
          } else {
            message = error.message;
          }
        }
        
        showNotification(message, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, formData, showNotification, onRegisterSuccess, login, navigate]
  );

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className={errors.name ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="nickName">Nick Name</label>
        <input
          id="nickName"
          type="text"
          name="nickName"
          value={formData.nickName}
          onChange={handleChange}
          placeholder="Enter your nick name"
          className={errors.nickName ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.nickName && <span className="error-message">{errors.nickName}</span>}
      </div>

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
          placeholder="Enter your password (min 8 chars, uppercase, lowercase, number)"
          className={errors.password ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          className={errors.confirmPassword ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <div className="form-group checkbox-group">
        <label htmlFor="isAdmin" className="checkbox-label">
          <input
            id="isAdmin"
            type="checkbox"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>Register as Admin</span>
        </label>
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
};

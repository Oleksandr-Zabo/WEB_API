import React, { useState, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { userService } from '../../services/userService.ts';
import { User, CreateUpdateUserRequest } from '../../types/user.types.ts';
import {
  isValidEmail,
  isEmptyString,
  validatePassword,
} from '../../utils/validation.util.ts';
import '../../styles/users/UserForm.css';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
  isAdminContext?: boolean; // Indicates if called from admin panel
}

interface FormErrors {
  name?: string;
  nickName?: string;
  email?: string;
  password?: string;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel, isAdminContext = false }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUpdateUserRequest>({
    name: user?.name || '',
    nickName: user?.nickName || '',
    email: user?.email || '',
    password: '',
    isAdmin: user?.isAdmin || false,
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

    if (isEmptyString(formData.password)) {
      newErrors.password = 'Password is required';
    } else if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors.join('; ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({ ...prev, [name]: checked }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      
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
        if (user) {
          const updateData: CreateUpdateUserRequest = {
            name: formData.name,
            nickName: formData.nickName,
            email: formData.email,
            password: formData.password,
            isAdmin: formData.isAdmin,
          };
          await userService.updateUser(user.id, updateData);
        } else {
          const submitData: CreateUpdateUserRequest = {
            name: formData.name,
            nickName: formData.nickName,
            email: formData.email,
            password: formData.password,
            isAdmin: formData.isAdmin,
          };
          // Use createUser for admin context, register for public registration
          if (isAdminContext) {
            await userService.createUser(submitData);
          } else {
            await userService.register(submitData);
          }
        }

        onSuccess();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Operation failed';
        showNotification(message, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, formData, user, onSuccess, showNotification, isAdminContext]
  );

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>{user ? 'Edit User' : 'Add User'}</h2>

      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
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
          placeholder="Enter nick name"
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
          placeholder="Enter email"
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
          placeholder={user ? 'Enter new password' : 'Enter password'}
          className={errors.password ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <div className="form-group checkbox">
        <input
          id="isAdmin"
          type="checkbox"
          name="isAdmin"
          checked={formData.isAdmin}
          onChange={handleChange}
          disabled={isLoading}
        />
        <label htmlFor="isAdmin">Admin User</label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

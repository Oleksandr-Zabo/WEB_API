import React, { useState, useCallback, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { authorService } from '../../services/authorService.ts';
import { Author, AuthorFormData } from '../../types/author.types.ts';
import { isEmptyString } from '../../utils/validation.util.ts';
import '../../styles/authors/AuthorForm.css';

interface AuthorFormProps {
  author?: Author;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

export const AuthorForm: React.FC<AuthorFormProps> = ({ author, onSuccess, onCancel }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthorFormData>({
    firstName: author?.firstName || '',
    lastName: author?.lastName || '',
    birthDate: author?.birthDate || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (isEmptyString(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (isEmptyString(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (isEmptyString(formData.birthDate)) {
      newErrors.birthDate = 'Birth date is required';
    } else if (isNaN(new Date(formData.birthDate).getTime())) {
      newErrors.birthDate = 'Invalid date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
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
        // Convert to PascalCase for backend and format date properly
        const birthDateObj = new Date(formData.birthDate);
        const submitData = {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          BirthDate: birthDateObj.toISOString(),
        };

        console.log('Submitting author data:', submitData);

        if (author) {
          await authorService.updateAuthor(author.id, submitData);
        } else {
          await authorService.createAuthor(submitData);
        }

        onSuccess();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Operation failed';
        showNotification(message, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, formData, author, onSuccess, showNotification]
  );

  return (
    <form className="author-form" onSubmit={handleSubmit}>
      <h2>{author ? 'Edit Author' : 'Add Author'}</h2>

      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter first name"
          className={errors.firstName ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter last name"
          className={errors.lastName ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="birthDate">Birth Date</label>
        <input
          id="birthDate"
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className={errors.birthDate ? 'input-error' : ''}
          disabled={isLoading}
          required
        />
        {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
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

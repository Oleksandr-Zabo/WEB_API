import React, { useState, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { genreService } from '../../services/genreService.ts';
import { Genre, GenreFormData } from '../../types/genre.types.ts';
import { isEmptyString } from '../../utils/validation.util.ts';
import '../../styles/genres/GenreForm.css';

interface GenreFormProps {
  genre?: Genre;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  description?: string;
}

export const GenreForm: React.FC<GenreFormProps> = ({ genre, onSuccess, onCancel }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<GenreFormData>({
    name: genre?.name || '',
    description: genre?.description || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (isEmptyString(formData.name)) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (genre) {
          await genreService.updateGenre(genre.id, formData);
        } else {
          await genreService.createGenre(formData);
        }

        onSuccess();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Operation failed';
        showNotification(message, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, formData, genre, onSuccess, showNotification]
  );

  return (
    <form className="genre-form" onSubmit={handleSubmit}>
      <h2>{genre ? 'Edit Genre' : 'Add Genre'}</h2>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter genre name"
          className={errors.name ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
          rows={4}
          disabled={isLoading}
        />
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

import React, { useState, useCallback, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { bookService } from '../../services/bookService.ts';
import { authorService } from '../../services/authorService.ts';
import { genreService } from '../../services/genreService.ts';
import { Book, BookFormData } from '../../types/book.types.ts';
import { Author } from '../../types/author.types.ts';
import { Genre } from '../../types/genre.types.ts';
import { isEmptyString } from '../../utils/validation.util.ts';
import '../../styles/books/BookForm.css';

interface BookFormProps {
  book?: Book;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  authorId?: string;
  genreIds?: string;
  isbn?: string;
  publishYear?: string;
  price?: string;
}

export const BookForm: React.FC<BookFormProps> = ({ book, onSuccess, onCancel }) => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [genresLoading, setGenresLoading] = useState(true);
  const [formData, setFormData] = useState<BookFormData>({
    title: book?.title || '',
    authorId: book?.authorId || '',
    genreIds: book?.genreIds || [],
    isbn: book?.isbn || '',
    publishYear: book?.publishYear || '',
    price: book?.price !== undefined ? book.price : '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsData, genresData] = await Promise.all([
          authorService.getAllAuthors(),
          genreService.getAllGenres(),
        ]);
        setAuthors(authorsData);
        setGenres(genresData);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch data';
        showNotification(message, 'error');
      } finally {
        setAuthorsLoading(false);
        setGenresLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (isEmptyString(formData.title)) {
      newErrors.title = 'Title is required';
    }

    if (isEmptyString(formData.authorId)) {
      newErrors.authorId = 'Author is required';
    }

    if (!Array.isArray(formData.genreIds) || formData.genreIds.length === 0) {
      newErrors.genreIds = 'At least one genre is required';
    }

    if (formData.publishYear) {
      const year = Number(formData.publishYear);
      if (isNaN(year) || year < 0 || year > new Date().getFullYear()) {
        newErrors.publishYear = 'Invalid year';
      }
    }

    if (formData.price === undefined || formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Price is required and must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, type, value } = e.target as HTMLInputElement | HTMLSelectElement;
      
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        const genreId = Number(value);
        setFormData((prev) => ({
          ...prev,
          genreIds: checked
            ? [...prev.genreIds, genreId]
            : prev.genreIds.filter((id) => id !== genreId),
        }));
      } else if (name === 'price') {
        setFormData((prev) => ({ ...prev, price: value }));
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
        // Convert to backend format with proper types
        const submitData = {
          title: formData.title,
          authorId: formData.authorId,
          isbn: formData.isbn || '',
          publishYear: formData.publishYear ? Number(formData.publishYear) : 0,
          price: formData.price !== undefined && formData.price !== '' ? Number(formData.price) : 0,
          genreIds: formData.genreIds,
        };

        console.log('Submitting book data:', submitData);

        if (book) {
          await bookService.updateBook(book.id, submitData);
        } else {
          await bookService.createBook(submitData);
        }

        onSuccess();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Operation failed';
        showNotification(message, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, formData, book, onSuccess, showNotification]
  );

  if (authorsLoading || genresLoading) {
    return <div className="book-form"><p>Loading...</p></div>;
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2>{book ? 'Edit Book' : 'Add Book'}</h2>

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter book title"
          className={errors.title ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="authorId">Author</label>
        <select
          id="authorId"
          name="authorId"
          value={formData.authorId}
          onChange={handleChange}
          className={errors.authorId ? 'input-error' : ''}
          disabled={isLoading}
        >
          <option value="">Select an author</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.firstName} {author.lastName}
            </option>
          ))}
        </select>
        {errors.authorId && <span className="error-message">{errors.authorId}</span>}
      </div>

      <div className="form-group">
        <label>Genres (select one or more)</label>
        <div className="genre-checkboxes">
          {genres
            .filter((genre) => genre.name.toLowerCase() !== 'unknown')
            .map((genre) => (
              <label key={genre.id} className="checkbox-label">
                <input
                  type="checkbox"
                  name="genreIds"
                  value={genre.id}
                  checked={formData.genreIds.includes(genre.id)}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {genre.name}
              </label>
            ))}
        </div>
        {errors.genreIds && <span className="error-message">{errors.genreIds}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="price">Price</label>
        <input
          id="price"
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Enter price"
          className={errors.price ? 'input-error' : ''}
          min="0"
          step="0.01"
          disabled={isLoading}
        />
        {errors.price && <span className="error-message">{errors.price}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="isbn">ISBN (optional)</label>
        <input
          id="isbn"
          type="text"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          placeholder="Enter ISBN"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="publishYear">Publish Year (optional)</label>
        <input
          id="publishYear"
          type="number"
          name="publishYear"
          value={formData.publishYear}
          onChange={handleChange}
          placeholder="Enter publish year"
          className={errors.publishYear ? 'input-error' : ''}
          disabled={isLoading}
        />
        {errors.publishYear && <span className="error-message">{errors.publishYear}</span>}
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

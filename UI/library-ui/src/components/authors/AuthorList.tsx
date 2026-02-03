import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { authorService } from '../../services/authorService.ts';
import { Author } from '../../types/author.types.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { AuthorForm } from './AuthorForm.tsx';
import '../../styles/authors/AuthorList.css';

export const AuthorList: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Author | null>(null);

  const fetchAuthors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authorService.getAuthorsWithBookCount();
      setAuthors(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch authors';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleEdit = (author: Author) => {
    setSelectedAuthor(author);
    setIsFormOpen(true);
  };

  const handleDelete = (author: Author) => {
    if ((author.bookCount || 0) > 0) {
      showNotification(
        `Cannot delete author with ${author.bookCount} book(s). Please remove all books first.`,
        'error'
      );
      return;
    }
    setDeleteConfirm(author);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await authorService.deleteAuthor(deleteConfirm.id);
      setAuthors(authors.filter((a) => a.id !== deleteConfirm.id));
      showNotification('Author deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete author';
      showNotification(message, 'error');
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setSelectedAuthor(null);
    await fetchAuthors();
    showNotification(
      selectedAuthor ? 'Author updated successfully' : 'Author created successfully',
      'success'
    );
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAuthor(null);
  };

  if (isLoading && authors.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="author-list-container">
      <div className="author-list-header">
        <h2>Authors</h2>
        {user?.isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedAuthor(null);
              setIsFormOpen(true);
            }}
          >
            Add Author
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="author-form-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseForm}>
              ×
            </button>
            <AuthorForm
              author={selectedAuthor || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Author"
          message={`Are you sure you want to delete ${deleteConfirm.firstName} ${deleteConfirm.lastName}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {authors.length === 0 ? (
        <div className="empty-state">
          <p>No authors found</p>
        </div>
      ) : (
        <div className="author-grid">
          {authors.map((author) => (
            <div key={author.id} className="author-card">
              <div className="author-info">
                <h3>{author.firstName} {author.lastName}</h3>
                {author.birthDate && (
                  <p className="birth-date">Born: {new Date(author.birthDate).toLocaleDateString()}</p>
                )}
                <p className="book-count">{author.bookCount || 0} books</p>
              </div>
              {user?.isAdmin && (
                <div className="author-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(author)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(author)}
                    disabled={(author.bookCount || 0) > 0}
                    title={(author.bookCount || 0) > 0 ? `Cannot delete: author has ${author.bookCount} book(s)` : ''}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { genreService } from '../../services/genreService.ts';
import { Genre } from '../../types/genre.types.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { GenreForm } from './GenreForm.tsx';
import '../../styles/genres/GenreList.css';

export const GenreList: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Genre | null>(null);

  const fetchGenres = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch genres';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  const handleEdit = (genre: Genre) => {
    setSelectedGenre(genre);
    setIsFormOpen(true);
  };

  const handleDelete = (genre: Genre) => {
    setDeleteConfirm(genre);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await genreService.deleteGenre(deleteConfirm.id);
      setGenres(genres.filter((g) => g.id !== deleteConfirm.id));
      showNotification('Genre deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete genre';
      showNotification(message, 'error');
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setSelectedGenre(null);
    await fetchGenres();
    showNotification(
      selectedGenre ? 'Genre updated successfully' : 'Genre created successfully',
      'success'
    );
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedGenre(null);
  };

  if (isLoading && genres.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="genre-list-container">
      <div className="genre-list-header">
        <h2>Genres</h2>
        {user?.isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedGenre(null);
              setIsFormOpen(true);
            }}
          >
            Add Genre
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="genre-form-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseForm}>
              ×
            </button>
            <GenreForm
              genre={selectedGenre || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Genre"
          message={`Are you sure you want to delete "${deleteConfirm.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {genres.length === 0 ? (
        <div className="empty-state">
          <p>No genres found</p>
        </div>
      ) : (
        <div className="genre-table-container">
          <table className="genre-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                {user?.isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {genres.map((genre) => (
                <tr key={genre.id}>
                  <td className="genre-name">{genre.name}</td>
                  <td className="genre-description">{genre.description || '-'}</td>
                  {user?.isAdmin && (
                    <td className="genre-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(genre)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(genre)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

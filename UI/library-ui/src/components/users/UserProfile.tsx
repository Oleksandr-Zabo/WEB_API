import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { userService } from '../../services/userService.ts';
import { Book } from '../../types/book.types.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { BookCard } from '../books/BookCard.tsx';
import '../../styles/users/UserProfile.css';

export const UserProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedBooks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const books = await userService.getUserSavedBooks(user.id);
      setSavedBooks(books);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch saved books';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchSavedBooks();
  }, [fetchSavedBooks]);

  if (!user) {
    return (
      <div className="user-profile-container">
        <div className="empty-state">
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Name:</label>
            <span className="info-value">{user.name}</span>
          </div>

          <div className="info-group">
            <label>Nick Name:</label>
            <span className="info-value">{user.nickName}</span>
          </div>

          <div className="info-group">
            <label>Email:</label>
            <span className="info-value">{user.email}</span>
          </div>

          <div className="info-group">
            <label>Role:</label>
            <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
              {user.isAdmin ? 'Administrator' : 'User'}
            </span>
          </div>
        </div>
      </div>

      <div className="saved-books-section">
        <h2>Saved Books ({savedBooks.length})</h2>
        {savedBooks.length === 0 ? (
          <div className="empty-state">
            <p>You haven't saved any books yet</p>
          </div>
        ) : (
          <div className="books-grid">
            {savedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

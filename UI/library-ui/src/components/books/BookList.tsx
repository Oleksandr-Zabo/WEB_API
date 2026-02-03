import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { bookService } from '../../services/bookService.ts';
import { userService } from '../../services/userService.ts';
import { Book } from '../../types/book.types.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { BookCard } from './BookCard.tsx';
import { BookForm } from './BookForm.tsx';
import { BookFilter } from './BookFilter.tsx';
import '../../styles/books/BookList.css';

export const BookList: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Book | null>(null);
  const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set());

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await bookService.getAllBooks();
      setBooks(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch books';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const fetchUserSavedBooks = useCallback(async () => {
    if (!user) return;
    try {
      const savedBooks = await userService.getUserSavedBooks(user.id);
      setSavedBookIds(new Set(savedBooks.map((book) => book.id)));
    } catch (error) {
      console.error('Failed to fetch saved books:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchUserSavedBooks();
    }
  }, [fetchBooks, user, fetchUserSavedBooks]);

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const handleDelete = (book: Book) => {
    setDeleteConfirm(book);
  };

  const handleSaveBook = async (book: Book) => {
    if (!user) {
      showNotification('Please login to save books', 'error');
      return;
    }

    try {
      await userService.addSavedBook(user.id, book.id);
      setSavedBookIds((prev) => new Set([...prev, book.id]));
      showNotification(`"${book.title}" added to saved books`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save book';
      showNotification(message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await bookService.deleteBook(deleteConfirm.id);
      setBooks(books.filter((b) => b.id !== deleteConfirm.id));
      showNotification('Book deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete book';
      showNotification(message, 'error');
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setSelectedBook(null);
    await fetchBooks();
    showNotification(
      selectedBook ? 'Book updated successfully' : 'Book created successfully',
      'success'
    );
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedBook(null);
  };

  const handleFilterApply = async (filters: any) => {
    setIsLoading(true);
    try {
      const data = await bookService.filterBooks(filters);
      setBooks(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to filter books';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && books.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="book-list-container">
      <div className="book-list-header">
        <h2>Books</h2>
        {user?.isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedBook(null);
              setIsFormOpen(true);
            }}
          >
            Add Book
          </button>
        )}
      </div>

      <BookFilter onApply={handleFilterApply} />

      {isFormOpen && (
        <div className="book-form-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseForm}>
              ×
            </button>
            <BookForm
              book={selectedBook || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Book"
          message={`Are you sure you want to delete "${deleteConfirm.title}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books found</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={user?.isAdmin ? handleEdit : undefined}
              onDelete={user?.isAdmin ? handleDelete : undefined}
              onSave={handleSaveBook}
              isSaved={savedBookIds.has(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

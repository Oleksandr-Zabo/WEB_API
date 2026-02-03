import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification.ts';
import { authorService } from '../../services/authorService.ts';
import { Book } from '../../types/book.types.ts';
import { Author } from '../../types/author.types.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { BookCard } from '../books/BookCard.tsx';
import '../../styles/authors/AuthorBooks.css';

export const AuthorBooks: React.FC = () => {
  const { authorId } = useParams<{ authorId: string }>();
  const { showNotification } = useNotification();
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuthorAndBooks = useCallback(async () => {
    if (!authorId) return;

    setIsLoading(true);
    try {
      const [authorData, booksData] = await Promise.all([
        authorService.getAuthorById(authorId),
        authorService.getAuthorBooks(authorId),
      ]);
      setAuthor(authorData);
      setBooks(booksData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [authorId, showNotification]);

  useEffect(() => {
    fetchAuthorAndBooks();
  }, [fetchAuthorAndBooks]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!author) {
    return (
      <div className="author-books-container">
        <div className="empty-state">
          <p>Author not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="author-books-container">
      <div className="author-header">
        <h1>{author.firstName} {author.lastName}</h1>
        {author.birthDate && (
          <p className="author-birth-date">Born: {new Date(author.birthDate).toLocaleDateString()}</p>
        )}
      </div>

      <div className="books-section">
        <h2>Books ({books.length})</h2>
        {books.length === 0 ? (
          <div className="empty-state">
            <p>No books found for this author</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

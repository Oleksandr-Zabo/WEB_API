import React from 'react';
import { Book } from '../../types/book.types.ts';
import '../../styles/books/BookCard.css';

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onSave?: (book: Book) => void;
  isSaved?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete, onSave, isSaved }) => {
  return (
    <div className="book-card">
      <div className="book-card-content">
        <h3 className="book-title">{book.title}</h3>
        {book.authorName && (
          <p className="book-author">By {book.authorName}</p>
        )}
        {book.genreNames && book.genreNames.length > 0 && (
          <p className="book-genre">{book.genreNames.join(', ')}</p>
        )}
        {book.isbn && (
          <p className="book-isbn">ISBN: {book.isbn}</p>
        )}
        {book.publishYear && (
          <p className="book-year">Published: {book.publishYear}</p>
        )}
        <p className="book-price">Price: ${book.price.toFixed(2)}</p>
      </div>
      {(onEdit || onDelete || onSave) && (
        <div className="book-card-actions">
          {onEdit && (
            <button
              className="btn btn-secondary"
              onClick={() => onEdit(book)}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-danger"
              onClick={() => onDelete(book)}
            >
              Delete
            </button>
          )}
          {onSave && (
            <button
              className="btn btn-success"
              onClick={() => onSave(book)}
              disabled={isSaved}
              title={isSaved ? 'Already saved' : 'Add to Saved'}
            >
              {isSaved ? '✓ Saved' : 'Add to Saved'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import { Book, CreateUpdateBookRequest, BookFormData } from '../types/book.types.ts';
import { API_BASE_URL } from '../apiConfig.ts';

interface BookFilterParams {
    searchTitle?: string;
    filterAuthorId?: string;
    filterGenreId?: string | number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('library-ui.authToken')}`,
});

const buildQueryParams = (params: BookFilterParams): URLSearchParams => {
    const queryParams = new URLSearchParams();
    if (params.searchTitle) queryParams.append('searchTitle', params.searchTitle);
    if (params.filterAuthorId) queryParams.append('filterAuthorId', params.filterAuthorId);
    if (params.filterGenreId) queryParams.append('filterGenreId', String(params.filterGenreId));
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    return queryParams;
};

const formatBookFormData = (data: BookFormData): CreateUpdateBookRequest => ({
    title: data.title,
    authorId: data.authorId,
    genreIds: Array.isArray(data.genreIds) ? data.genreIds : [],
    isbn: data.isbn || '',
    publishYear: typeof data.publishYear === 'string' ? parseInt(data.publishYear, 10) : data.publishYear || 0,
    price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
});

export const bookService = {
    // Get all books
    getAllBooks: async (): Promise<Book[]> => {
        const response = await fetch(`${API_BASE_URL}/Book`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch books');
        return response.json();
    },

    // Get book by ID
    getBookById: async (id: string): Promise<Book> => {
        const response = await fetch(`${API_BASE_URL}/Book/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch book');
        return response.json();
    },

    // Filter books with multiple criteria
    filterBooks: async (params: BookFilterParams): Promise<Book[]> => {
        const queryParams = buildQueryParams(params);
        const response = await fetch(`${API_BASE_URL}/Book/filter?${queryParams}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to filter books');
        return response.json();
    },

    // Get books by genre
    getBooksByGenre: async (genreId: string | number): Promise<Book[]> => {
        const response = await fetch(`${API_BASE_URL}/Book/by-genre/${genreId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch books by genre');
        return response.json();
    },

    // Search books by title
    searchBooksByTitle: async (title: string): Promise<Book[]> => {
        return bookService.filterBooks({ searchTitle: title });
    },

    // Create book (Admin only)
    createBook: async (data: CreateUpdateBookRequest | BookFormData): Promise<Book> => {
        const bookData = 'genreIds' in data ? data : formatBookFormData(data as BookFormData);

        const response = await fetch(`${API_BASE_URL}/Book`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(bookData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create book: ${errorText}`);
        }
        return response.json();
    },

    // Update book (Admin only)
    updateBook: async (id: string, data: CreateUpdateBookRequest | BookFormData): Promise<Book> => {
        const bookData = 'genreIds' in data ? data : formatBookFormData(data as BookFormData);

        const response = await fetch(`${API_BASE_URL}/Book/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(bookData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update book: ${errorText}`);
        }
        return response.json();
    },

    // Delete book (Admin only)
    deleteBook: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/Book/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to delete book');
        return response.json();
    },
};
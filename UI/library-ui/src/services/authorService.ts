import { Author, CreateUpdateAuthorRequest } from '../types/author.types.ts';
import { Book } from '../types/book.types.ts';
import { API_BASE_URL } from '../apiConfig.ts';


const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('library-ui.authToken')}`,
});

export const authorService = {
    // Get all authors
    getAllAuthors: async (): Promise<Author[]> => {
        const response = await fetch(`${API_BASE_URL}/Author`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch authors');
        return response.json();
    },

    // Get authors with book count
    getAuthorsWithBookCount: async (): Promise<Author[]> => {
        const response = await fetch(`${API_BASE_URL}/Author/with-book-count`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch authors with book count');
        return response.json();
    },

    // Get author by ID
    getAuthorById: async (id: string): Promise<Author> => {
        const response = await fetch(`${API_BASE_URL}/Author/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch author');
        return response.json();
    },

    // Get author's books
    getAuthorBooks: async (id: string): Promise<Book[]> => {
        const response = await fetch(`${API_BASE_URL}/Author/${id}/books`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch author books');
        return response.json();
    },

    // Create author (Admin only)
    createAuthor: async (data: CreateUpdateAuthorRequest): Promise<Author> => {
        const response = await fetch(`${API_BASE_URL}/Author`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create author');
        return response.json();
    },

    // Update author (Admin only)
    updateAuthor: async (id: string, data: CreateUpdateAuthorRequest): Promise<Author> => {
        const response = await fetch(`${API_BASE_URL}/Author/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update author');
        return response.json();
    },

    // Delete author (Admin only)
    deleteAuthor: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/Author/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to delete author');
        return response.json();
    },
};
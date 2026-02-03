import { Genre, CreateUpdateGenreRequest } from '../types/genre.types.ts';
import { API_BASE_URL } from '../apiConfig.ts';

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('library-ui.authToken')}`,
});

export const genreService = {
    getAllGenres: async (): Promise<Genre[]> => {
        const response = await fetch(`${API_BASE_URL}/Genre`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch genres');
        return response.json();
    },

    getGenreById: async (id: number): Promise<Genre> => {
        const response = await fetch(`${API_BASE_URL}/Genre/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch genre');
        return response.json();
    },

    createGenre: async (data: CreateUpdateGenreRequest): Promise<Genre> => {
        const response = await fetch(`${API_BASE_URL}/Genre`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create genre');
        return response.json();
    },

    updateGenre: async (id: number, data: CreateUpdateGenreRequest): Promise<Genre> => {
        const response = await fetch(`${API_BASE_URL}/Genre/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update genre');
        return response.json();
    },

    deleteGenre: async (id: number): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/Genre/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to delete genre');
        return response.json();
    },
};
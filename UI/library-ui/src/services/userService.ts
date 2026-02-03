import { API_BASE_URL } from '../apiConfig.ts';
import { Book } from '../types/book.types.ts';
import { User, CreateUpdateUserRequest } from '../types/user.types.ts';

const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('library-ui.authToken')}`,
});

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

export const userService = {
    // Login (Public)
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await fetch(`${API_BASE_URL}/User/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    // Get all users (Admin only)
    getAllUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_BASE_URL}/User`, {
            method: 'GET',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    // Get user by ID (Self/Admin)
    getUserById: async (id: string): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/User/${id}`, {
            method: 'GET',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    // Register (Public)
    register: async (data: CreateUpdateUserRequest): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/User/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    },

    // Update user (Self/Admin)
    updateUser: async (id: string, data: CreateUpdateUserRequest): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/User/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update user: ${errorText}`);
        }
        return response.json();
    },

    // Delete user (Admin only)
    deleteUser: async (id: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/User/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete user: ${errorText}`);
        }
        return response.json();
    },

    // Get user's saved books (Self/Admin)
    getUserSavedBooks: async (userId: string): Promise<Book[]> => {
        const response = await fetch(`${API_BASE_URL}/User/${userId}/saved-books`, {
            method: 'GET',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch saved books');
        return response.json();
    },

    // Add book to saved books (Self/Admin)
    addSavedBook: async (userId: string, bookId: string): Promise<Book> => {
        const response = await fetch(`${API_BASE_URL}/User/${userId}/saved-books/${bookId}`, {
            method: 'POST',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to save book');
        return response.json();
    },

    // Remove book from saved books (Self/Admin)
    removeSavedBook: async (userId: string, bookId: string): Promise<{ message: string }> => {
        const response = await fetch(`${API_BASE_URL}/User/${userId}/saved-books/${bookId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to remove saved book');
        return response.json();
    },
};
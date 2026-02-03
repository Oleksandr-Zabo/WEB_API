import { User } from '../types/user.types.ts';

const STORAGE_KEY = 'library-ui.currentUser';
const TOKEN_KEY = 'library-ui.authToken';

export const getUserFromStorage = (): User | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as User) : null;
    } catch {
        console.error('Failed to read user from storage');
        return null;
    }
};

export const saveUserToStorage = (user: User | null): void => {
    try {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        console.error('Failed to save user to storage');
    }
};

export const getTokenFromStorage = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        console.error('Failed to read token from storage');
        return null;
    }
};

export const saveTokenToStorage = (token: string | null): void => {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch {
        console.error('Failed to save token to storage');
    }
};

export const clearAuthStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        console.error('Failed to clear auth storage');
    }
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;

        const decoded = JSON.parse(atob(parts[1]));
        const expiryTime = decoded.exp * 1000;
        return expiryTime < Date.now();
    } catch {
        return true;
    }
};

export const decodeToken = (token: string): Record<string, unknown> | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        return JSON.parse(atob(parts[1]));
    } catch {
        return null;
    }
};
import { useCallback, useMemo, useState } from 'react';
import { User } from '../types/user.types.ts';

const STORAGE_KEY = 'library-ui.currentUser';

const readStoredUser = (): User | null => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as User) : null;
	} catch {
		return null;
	}
};

const writeStoredUser = (user: User | null) => {
	try {
		if (user) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		// ignore storage errors
	}
};

export const useAuth = () => {
	const [user, setUserState] = useState<User | null>(() => readStoredUser());

	const setUser = useCallback((nextUser: User | null) => {
		setUserState(nextUser);
		writeStoredUser(nextUser);
	}, []);

	const login = useCallback((nextUser: User) => {
		setUser(nextUser);
	}, [setUser]);

	const logout = useCallback(() => {
		setUser(null);
	}, [setUser]);

	const isAuthenticated = useMemo(() => Boolean(user), [user]);

	return {
		user,
		isAuthenticated,
		login,
		logout,
		setUser,
	};
};

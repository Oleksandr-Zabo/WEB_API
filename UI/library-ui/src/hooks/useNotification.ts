import { useCallback, useState } from 'react';
import { NotificationState, NotificationType } from '../types/api.types.ts';

const initialState: NotificationState = {
	message: '',
	type: 'info',
	isVisible: false,
};

export const useNotification = (defaultState: NotificationState = initialState) => {
	const [notification, setNotification] = useState<NotificationState>(defaultState);

	const showNotification = useCallback(
		(message: string, type: NotificationType = 'info') => {
			setNotification({ message, type, isVisible: true });
		},
		[]
	);

	const hideNotification = useCallback(() => {
		setNotification((prev) => ({ ...prev, isVisible: false }));
	}, []);

	const clearNotification = useCallback(() => {
		setNotification(initialState);
	}, []);

	return {
		notification,
		showNotification,
		hideNotification,
		clearNotification,
	};
};

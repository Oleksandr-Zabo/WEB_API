import React, { useEffect } from 'react';
import { NotificationState, NotificationType } from '../../types/api.types.ts';
import '../../styles/common/Notification.css';

interface NotificationProps {
  notification: NotificationState;
  onClose: () => void;
  autoCloseDuration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
  autoCloseDuration = 4000,
}) => {
  useEffect(() => {
    if (!notification.isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [notification.isVisible, autoCloseDuration, onClose]);

  if (!notification.isVisible) return null;

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-content">
        <span className={`notification-icon icon-${notification.type}`}>
          {notification.type === 'success' && '✓'}
          {notification.type === 'error' && '✕'}
          {notification.type === 'info' && 'ℹ'}
        </span>
        <p className="notification-message">{notification.message}</p>
      </div>
      <button
        className="notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

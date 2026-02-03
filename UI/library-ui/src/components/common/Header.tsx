import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useNotification } from '../../hooks/useNotification.ts';
import '../../styles/common/Header.css';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('library-ui.authToken');
    showNotification('Logged out successfully', 'success');
    setIsMenuOpen(false);
    // Redirect to register page with page reload
    window.location.href = '/auth';
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <h1>📚 Library UI</h1>
        </div>

        {user && (
          <div className="header-user">
            <button 
              className="user-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="user-info">
                {user.nickName || user.name}
                {user.isAdmin && <span className="admin-badge">Admin</span>}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {isMenuOpen && (
              <div className="user-dropdown">
                <a href="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  <span className="dropdown-icon">👤</span>
                  My Profile
                </a>
                <a href="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  <span className="dropdown-icon">📚</span>
                  Saved Books
                </a>
                <button
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

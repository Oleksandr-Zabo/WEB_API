import React from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import '../../styles/common/Navigation.css';

interface NavigationLink {
  label: string;
  path: string;
  adminOnly?: boolean;
}

const navLinks: NavigationLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Books', path: '/books' },
  { label: 'Authors', path: '/authors' },
  { label: 'Genres', path: '/genres', adminOnly: false },
  { label: 'My Profile', path: '/profile', adminOnly: false },
  { label: 'Users', path: '/users', adminOnly: true },
];

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredLinks = navLinks.filter(
    (link) => !link.adminOnly || user?.isAdmin
  );

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <button
          className="nav-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
          {filteredLinks.map((link) => (
            <li key={link.path} className="nav-item">
              <a
                href={link.path}
                className="nav-link"
                onClick={handleNavClick}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

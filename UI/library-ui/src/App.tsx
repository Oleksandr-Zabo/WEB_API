import React, { useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.ts';
import { useNotification } from './hooks/useNotification.ts';

// Auth Components
import { AuthContainer } from './components/auth/AuthContainer.tsx';
import { LoginForm } from './components/auth/LoginForm.tsx';
import { RegisterForm } from './components/auth/RegisterForm.tsx';

// Books Components
import { BookList } from './components/books/BookList.tsx';

// Authors Components
import { AuthorList } from './components/authors/AuthorList.tsx';
import { AuthorBooks } from './components/authors/AuthorBooks.tsx';

// Genres Components
import { GenreList } from './components/genres/GenreList.tsx';

// Users Components
import { UserList } from './components/users/UserList.tsx';
import { UserProfile } from './components/users/UserProfile.tsx';

// Common Components
import { Header } from './components/common/Header.tsx';
import { Navigation } from './components/common/Navigation.tsx';
import { Notification } from './components/common/Notification.tsx';

import './App.css';

// Protected Route Component
interface ProtectedRouteProps {
  element: React.ReactElement;
  isAuthenticated: boolean;
  isAdminOnly?: boolean;
  isAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  isAuthenticated,
  isAdminOnly = false,
  isAdmin = false,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isAdminOnly && !isAdmin) {
    return <Navigate to="/books" replace />;
  }

  return element;
};

// Layout Component
interface LayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <Navigation />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

// Home Page Component
const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome to Library UI</h1>
        {user ? (
          <p>
            Hello, <strong>{user.nickName || user.name}</strong>! 📚
          </p>
        ) : (
          <p>Please log in to access the library</p>
        )}
      </div>

      {user && (
        <div className="quick-stats">
          <a href="/books" className="stat-card">
            <h3>📕 Books</h3>
            <p>Browse our collection</p>
          </a>
          <a href="/authors" className="stat-card">
            <h3>✍️ Authors</h3>
            <p>Explore authors</p>
          </a>
          <a href="/genres" className="stat-card">
            <h3>📚 Genres</h3>
            <p>Discover genres</p>
          </a>
          {user.isAdmin && (
            <a href="/users" className="stat-card">
              <h3>👥 Users</h3>
              <p>Manage users</p>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// Auth Layout Component (without Header/Navigation)
interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { notification, hideNotification } = useNotification();

  // Handle initial auth token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('library-ui.authToken');
    const storedUser = localStorage.getItem('library-ui.currentUser');
    if (token && storedUser) {
      try {
        // Auth state is already restored from localStorage via useAuth hook
      } catch (error) {
        localStorage.removeItem('library-ui.authToken');
        localStorage.removeItem('library-ui.currentUser');
      }
    }
  }, []);

  return (
    <Router>
      <Notification
        notification={notification}
        onClose={hideNotification}
        autoCloseDuration={4000}
      />

      <Routes>
        {/* Auth Routes - No Header/Navigation */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/books" replace />
            ) : (
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/books" replace />
            ) : (
              <AuthLayout>
                <RegisterForm />
              </AuthLayout>
            )
          }
        />
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/books" replace />
            ) : (
              <AuthLayout>
                <AuthContainer />
              </AuthLayout>
            )
          }
        />

        {/* Protected Routes - With Header/Navigation */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainLayout>
                <HomePage />
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Books Routes */}
        <Route
          path="/books"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <BookList />
                </MainLayout>
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />

        {/* Authors Routes */}
        <Route
          path="/authors"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <AuthorList />
                </MainLayout>
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />

        <Route
          path="/authors/:authorId"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <AuthorBooks />
                </MainLayout>
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />

        {/* Genres Routes */}
        <Route
          path="/genres"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <GenreList />
                </MainLayout>
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />

        {/* Users Routes - Admin Only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <UserList />
                </MainLayout>
              }
              isAuthenticated={isAuthenticated}
              isAdminOnly={true}
              isAdmin={user?.isAdmin}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <UserProfile />
                </MainLayout>
              }
              isAuthenticated={isAuthenticated}
            />
          }
        />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <MainLayout>
                <div className="not-found-container">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary">
                    Go Home
                  </a>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

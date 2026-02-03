import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../../hooks/useNotification.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { userService } from '../../services/userService.ts';
import { User } from '../../types/user.types.ts';
import { LoadingSpinner } from '../common/LoadingSpinner.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { UserForm } from './UserForm.tsx';
import '../../styles/users/UserList.css';

export const UserList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeleteConfirm(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await userService.deleteUser(deleteConfirm.id);
      setUsers(users.filter((u) => u.id !== deleteConfirm.id));
      showNotification('User deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      showNotification(message, 'error');
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setSelectedUser(null);
    await fetchUsers();
    showNotification(
      selectedUser ? 'User updated successfully' : 'User created successfully',
      'success'
    );
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  if (isLoading && users.length === 0) {
    return <LoadingSpinner />;
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="user-list-container">
        <div className="empty-state">
          <p>Access denied. Admin only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>Users</h2>
      </div>

      {isFormOpen && (
        <div className="user-form-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseForm}>
              ×
            </button>
            <UserForm
              user={selectedUser || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete "${deleteConfirm.nickName || deleteConfirm.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Nick Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-nickname">{user.nickName}</td>
                  <td className="user-role">
                    <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="user-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    {currentUser.id !== user.id && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(user)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

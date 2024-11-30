import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import EditProfileModal from '../components/EditProfileModal';
import Alert from '../components/Alert';

const UserManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    login: '',
    password: '',
    passwordConfirmation: '',
    email: '',
    role: 'user',
  });
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [validationError, setValidationError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      setError("Не удалось загрузить список пользователей");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
  const { login, password, passwordConfirmation, email } = newUser;

  if (!login || !password || !passwordConfirmation || !email) {
    setAlertMessage("All fields must be completed");
    return false;
  }
  const validateLogin = (login) => {
    const loginRegex = /^[a-zA-Z0-9_]{4,20}$/; // Логин должен быть от 4 до 20 символов, только буквы, цифры и подчеркивания
    return loginRegex.test(login);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,20}$/; // Пароль должен содержать хотя бы одну заглавную букву, цифру, и быть длиной от 6 до 20 символов
    return passwordRegex.test(password);
  };

 if (!validateLogin(login)) {
      setAlertMessage('Username must be between 4 and 20 characters and contain only letters, numbers, and underscores');
      return;
    }

    if (!validatePassword(password)) {
      setAlertMessage('Password must be between 6 and 20 characters, include at least one uppercase letter and one number');
      return;
    }

  if (password !== passwordConfirmation) {
    setAlertMessage("Passwords don't match");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setAlertMessage("Enter a correct email");
    return false;
  }

  setAlertMessage("");
  return true;
};

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user.id !== userId));
      setDeletingUserId(null);
      setAlertMessage("User deleted successfully");
    } catch (error) {
      setError("Failed to delete user");
    }
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return; 
    try {
      await axios.post("http://localhost:5000/api/users", newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUser({ login: '', password: '', passwordConfirmation: '', email: '', role: 'user' });
      setIsCreateModalOpen(false);
      fetchUsers();
      setAlertMessage("New user created");
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
      setAlertMessage("Failed to create user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async (updatedUser) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/${editingUser.id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingUser(null);
      fetchUsers();
      setAlertMessage("User updated successfully");
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      setAlertMessage("Failed to update user");
    }
  };

  if (users.length === 0) {
    return (
      <div className="no-posts">
        <img src="path/to/no-posts-icon.png" alt="No posts" className="no-posts-icon" />
        <p>No users available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">User management</h2>
      
      {error && <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-center">{error}</p>}

      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          title="Create new user"
          className="text-3xl text-white bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 transition"
        >
          +
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-150">
            <div className="mb-2">
              <span className="font-semibold text-gray-500">Login:</span>
              <span className="ml-2 text-gray-700">{user.login}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-500">Role:</span>
              <span className="ml-2 text-gray-700">{user.role}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-500">Email:</span>
              <span className="ml-2 text-gray-700">{user.email}</span>
            </div>
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => handleEdit(user)} 
                className="text-gray-600 hover:text-black transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232a2 2 0 112.828 2.828l-9.064 9.064a4 4 0 01-1.5.98l-3.682 1.474a1 1 0 01-1.265-1.265l1.474-3.682a4 4 0 01.98-1.5l9.064-9.064z" />
                </svg>
              </button>
              <button 
                onClick={() => setDeletingUserId(user.id)} 
                className="text-gray-600 hover:text-black transition duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {deletingUserId && (
        <ConfirmModal
          message="Are you sure you want to delete the user?"
          onConfirm={() => handleDelete(deletingUserId)}
          onCancel={() => setDeletingUserId(null)}
        />
      )}

{isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Create new user</h3>

            {validationError && (
              <p className="text-red-600 text-sm mb-4">{validationError}</p>
            )}

            <input
              type="text"
              name="login"
              placeholder="Login"
              value={newUser.login}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-100 text-gray-900 rounded border border-gray-300"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newUser.password}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-100 text-gray-900 rounded border border-gray-300"
            />
            <input
              type="password"
              name="passwordConfirmation"
              placeholder="Confirm password"
              value={newUser.passwordConfirmation}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-100 text-gray-900 rounded border border-gray-300"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-100 text-gray-900 rounded border border-gray-300"
            />
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-100 text-gray-900 rounded border border-gray-300"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-between mt-4">
              <button 
                onClick={handleCreateUser} 
                className="bg-gray-800 py-2 px-4 rounded shadow hover:bg-gray-700 transition duration-150 text-white"
              >
                Save
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="bg-gray-600 py-2 px-4 rounded shadow hover:bg-gray-500 transition duration-150 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <EditProfileModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </div>
  );
};

export default UserManagement;

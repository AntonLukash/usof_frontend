import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';
import { FaSpinner, FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

 
  const validateLogin = (login) => {
    const loginRegex = /^[a-zA-Z0-9_]{4,20}$/; // Логин должен быть от 4 до 20 символов, только буквы, цифры и подчеркивания
    return loginRegex.test(login);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,20}$/; // Пароль должен содержать хотя бы одну заглавную букву, цифру, и быть длиной от 6 до 20 символов
    return passwordRegex.test(password);
  };

  const handleLogin = (e) => {
    e.preventDefault();

   if (!validateLogin(username)) {
      setAlertMessage('Username must be between 4 and 20 characters and contain only letters, numbers, and underscores');
      return;
    }

    if (!validatePassword(password)) {
      setAlertMessage('Password must be between 6 and 20 characters, include at least one uppercase letter and one number');
      return;
    }

    setIsLoginLoading(true);

    dispatch(login({ login: username, password }))
      .then((userId) => {
        setIsLoginLoading(false);
        if (userId) {
          navigate(`/profile/${userId}`);
        } else {
          setAlertMessage(error); 
        }
      })
      .catch(() => {
        setIsLoginLoading(false);
        setAlertMessage('An error occurred during login');
      });
  };

  const handlePasswordResetRequest = async () => {
    if (!email) {
      setAlertMessage('Please enter your email address');
      return;
    }

    setIsPasswordResetLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/password-reset', { email });
      setAlertMessage('A link to reset your password has been sent to your email');
    } catch (error) {
      console.error('Error while sending password reset request:', error);
      if (error.response && error.response.status === 404) {
        setAlertMessage('No user found with this email');
      } else {
        setAlertMessage('Failed to send password reset request');
      }
    } finally {
      setIsPasswordResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleLogin} className="auth-form">
          
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
            disabled={isLoginLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
            disabled={isLoginLoading}
          />
          <button type="submit" className="auth-button w-full bg-gray-600 text-white font-semibold py-2 rounded-lg hover:bg-gray-700 transition" disabled={isLoginLoading}>
            {isLoginLoading ? <FaSpinner className="spinner animate-spin" /> : 'Sign In'}
          </button>
          
        </form>

        {/* Кнопка для восстановления пароля */}
        <button
          onClick={() => setShowPasswordReset(!showPasswordReset)}
          className="mt-6 text-sm text-gray-600 hover:text-gray-500 transition duration-300"
        >
          Forgot your password?
        </button>

        {/* Поле для ввода email и кнопка отправки запроса */}
        {showPasswordReset && (
          <div className="mt-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isPasswordResetLoading} 
            />
            <button
              onClick={() => {
                if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                  setAlertMessage("Please enter a valid email address");
                  return;
                }
                handlePasswordResetRequest();
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
              disabled={isPasswordResetLoading} 
            >
              {isPasswordResetLoading ? <FaSpinner className="spinner animate-spin" /> : 'Reset Password'}
            </button>
          </div>
        )}

      </div>
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </div>
  );
};

export default LoginPage;

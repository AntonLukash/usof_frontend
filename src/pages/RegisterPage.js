import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { FaSpinner } from 'react-icons/fa';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,20}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (username.length < 6) {
      setAlertMessage('Username must be at least 6 characters long');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage('Please enter a valid email');
      return;
    }
  
    if (!validatePassword(password)) {
      setAlertMessage('Password must be at least 6 characters long, contain at least one uppercase letter and one number');
      return;
    }
  
    if (password !== passwordConfirmation) {
      setAlertMessage('Passwords do not match');
      return;
    }
  
    setAlertMessage(null);
    setLoading(true);
  
    try {
      await dispatch(register({ login: username, email, password, passwordConfirmation }));
  
      setAlertMessage('Registration successful! Please check your email.');
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      const errorMessage = err.message || 'An unknown error occurred';
      setAlertMessage(errorMessage);
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Register</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
          <button
            type="submit"
            className="auth-button w-full bg-gray-600 text-white font-semibold py-2 rounded-lg hover:bg-gray-700 transition"
            disabled={loading}
          >
            {loading ? <FaSpinner className="spinner animate-spin" /> : 'Sign Up'}
          </button>
        </form>
        <p className="auth-alt-option mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800">Log in</a>
        </p>
      </div>

      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </div>
  );
};

export default RegisterPage;

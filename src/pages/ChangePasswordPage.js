import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '../components/Alert';
import { FaSpinner } from 'react-icons/fa'; // Иконка крутящегося кружочка

const ChangePasswordPage = () => {
  const { token } = useParams(); // Получаем токен из URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(false); // Стейт для отслеживания загрузки
  const navigate = useNavigate();

  // Функция для валидации пароля
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,20}$/; // Пароль должен содержать хотя бы одну заглавную букву, цифру, и быть длиной от 6 до 20 символов
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация пароля
    if (!validatePassword(newPassword)) {
      setAlertMessage("Пароль должен содержать хотя бы одну заглавную букву, цифру, и быть длиной от 6 до 20 символов");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertMessage("Пароли не совпадают");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/password-reset/${token}`, {
        newPassword: newPassword,
      });

      if (response.status === 200) {
        setAlertMessage("Password changed successfully");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error(err);

      if (err.response && err.response.status === 400) {
        setAlertMessage("Token is invalid or expired");
      } else {
        setAlertMessage("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <h2>Change Password</h2>
      {/* Показ алерта */}
      {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? <FaSpinner className="spinner" /> : 'Change'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;

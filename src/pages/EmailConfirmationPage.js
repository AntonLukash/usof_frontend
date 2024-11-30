import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineLoading3Quarters } from 'react-icons/ai';

const EmailConfirmationPage = () => {
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await axios.get(`http://localhost:5000/api/auth/confirm-email/${token}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 5000);
      } catch (error) {
        console.error('Email confirmation failed:', error);
        setStatus('error');
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-white">
      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md transition-transform transform hover:scale-105">
        {status === 'loading' && (
          <div className="text-center animate-fade-in">
            <AiOutlineLoading3Quarters className="text-blue-500 text-6xl animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Confirming your email...</h2>
            <p className="text-gray-500">Please wait while we verify your email address.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="text-center animate-fade-in">
            <AiOutlineCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Email Confirmed!</h1>
            <p className="mt-4 text-gray-600">Thank you for verifying your email. You’ll be redirected to the login page shortly.</p>
            <p className="mt-2 text-sm text-gray-500">
              If you are not redirected,{' '}
              <a href="/login" className="text-gray-500 underline">
                click here to log in
              </a>.
            </p>
          </div>
        )}
        {status === 'error' && (
          <div className="text-center animate-fade-in">
            <AiOutlineCloseCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Confirmation Failed</h1>
            <p className="mt-4 text-gray-600">
              The link may have expired or is invalid. Please try to resend the confirmation email.
            </p>
            <button
              className="mt-6 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              onClick={() => navigate('/resend-confirmation')}
            >
              Resend Confirmation Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmationPage;

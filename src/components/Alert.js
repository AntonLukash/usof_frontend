import React, { useEffect } from 'react';

const Alert = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 p-5 bg-black text-white text-lg rounded-lg shadow-lg animate-fade-in-out flex items-center space-x-4">
      {/* Кружок с иконкой */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white shadow-md">
        <i className="fas fa-info-circle text-xl"></i>
      </div>

      <span className="font-medium leading-5">{message}</span>

      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="text-white hover:text-gray-300 transition-all duration-300"
      >
        <i className="fas fa-times text-xl"></i>
      </button>
    </div>
  );
};

export default Alert;

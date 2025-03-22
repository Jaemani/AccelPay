import React from 'react';

export const Button = ({ 
  children, 
  className = '', 
  type = 'button', 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        disabled 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, className = '', disabled, ...props }) => (
  <button
    disabled={isLoading || disabled}
    className={`w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {isLoading ? 'Loading...' : children}
  </button>
);

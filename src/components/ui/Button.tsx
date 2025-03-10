'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    primary: 'bg-[var(--primary)] hover:bg-[#27ae60] text-white border-transparent focus:ring-[var(--primary)]',
    secondary: 'bg-[var(--data-blue)] hover:bg-[#0062c4] text-white border-transparent focus:ring-[var(--data-blue)]',
    danger: 'bg-[var(--danger)] hover:bg-[#e03453] text-white border-transparent focus:ring-[var(--danger)]',
    outline: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-gray-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
} 
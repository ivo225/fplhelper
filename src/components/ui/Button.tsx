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
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all';
  
  const variantClasses = {
    primary: 'bg-fpl-gradient hover:opacity-90 text-white border-transparent focus:ring-[var(--fpl-purple)]',
    secondary: 'relative p-[2px] bg-gradient-to-r from-[var(--fpl-purple-dark)] via-[var(--fpl-purple)] to-[var(--fpl-blue)] rounded-md',
    danger: 'bg-[var(--danger)] hover:opacity-90 text-white border-transparent focus:ring-[var(--danger)]',
    outline: 'relative p-[1px] bg-gradient-to-r from-[var(--fpl-purple-dark)] via-[var(--fpl-purple)] to-[var(--fpl-blue)] rounded-md',
  };

  // Inner classes for secondary and outline buttons
  const innerClasses = {
    secondary: 'bg-white text-[var(--fpl-purple-dark)] rounded-[3px] flex items-center justify-center w-full h-full px-4 py-2 hover:bg-gray-50',
    outline: 'bg-white text-[var(--fpl-purple-dark)] rounded-[3px] flex items-center justify-center w-full h-full px-4 py-2 hover:bg-gray-50',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  if (variant === 'secondary' || variant === 'outline') {
    return (
      <button
        type={type}
        className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        <span className={innerClasses[variant]}>
          {children}
        </span>
      </button>
    );
  }

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

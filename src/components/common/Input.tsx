import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2.5 bg-dark-800 border rounded-lg',
          'text-white placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all duration-200',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-dark-600 hover:border-dark-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
};


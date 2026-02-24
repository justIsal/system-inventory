import { type InputHTMLAttributes, forwardRef } from 'react';

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ error, className = '', ...props }, ref) => (
  <div className="w-full">
    <input
      ref={ref}
      className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors 
        ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} 
        ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));
Input.displayName = 'Input';

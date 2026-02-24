import { type HTMLAttributes } from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ children, variant = 'default', className = '', ...props }: BadgeProps) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

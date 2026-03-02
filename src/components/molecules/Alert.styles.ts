import { cva } from 'class-variance-authority';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:
          'border-green-500/50 text-green-700 bg-green-50 dark:bg-green-900/10 [&>svg]:text-green-600',
        error: 'border-red-500/50 text-red-700 bg-red-50 dark:bg-red-900/10 [&>svg]:text-red-600',
        warning:
          'border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 [&>svg]:text-yellow-600',
        info: 'border-blue-500/50 text-blue-700 bg-blue-50 dark:bg-blue-900/10 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const alertIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

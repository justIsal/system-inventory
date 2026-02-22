import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: 
          "border-green-500/50 text-green-700 bg-green-50 dark:bg-green-900/10 [&>svg]:text-green-600",
        error:
          "border-red-500/50 text-red-700 bg-red-50 dark:bg-red-900/10 [&>svg]:text-red-600",
        warning:
          "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 [&>svg]:text-yellow-600",
        info:
          "border-blue-500/50 text-blue-700 bg-blue-50 dark:bg-blue-900/10 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const icons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, children, ...props }, ref) => {
    const Icon = icons[variant || 'default'];
    return (
      <div
        ref={ref}
        role="alert"
        className={alertVariants({ variant, className })}
        {...props}
      >
        <Icon className="h-4 w-4" />
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="pl-7 text-sm [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

export { Alert, alertVariants }

import React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { alertVariants, alertIcons } from './Alert.styles';

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, children, ...props }, ref) => {
    const Icon = alertIcons[variant || 'default'];
    return (
      <div ref={ref} role="alert" className={alertVariants({ variant, className })} {...props}>
        <Icon className="h-4 w-4" />
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="pl-7 text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
    );
  },
);
Alert.displayName = 'Alert';

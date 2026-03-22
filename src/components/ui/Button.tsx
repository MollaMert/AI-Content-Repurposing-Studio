import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
          variant === 'primary' && 'bg-accent hover:bg-accent-hover text-white',
          variant === 'secondary' && 'bg-glass border border-glass-border text-white/80 hover:bg-white/10',
          variant === 'ghost' && 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

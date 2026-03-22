import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm text-white/60">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'px-4 py-2 rounded-lg bg-white/5 border border-glass-border text-white placeholder:text-white/40',
            'focus:outline-none focus:border-accent transition-colors duration-200',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

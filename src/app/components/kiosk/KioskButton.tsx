import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../ui/utils';

interface KioskButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'large' | 'touch';
}

export const KioskButton = forwardRef<HTMLButtonElement, KioskButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-sm transition-all duration-200',
          'font-medium tracking-wide uppercase text-sm',
          'active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-black text-white hover:bg-gray-800': variant === 'primary',
            'bg-white text-black border border-black hover:bg-gray-100': variant === 'secondary',
            'bg-transparent hover:bg-gray-100': variant === 'ghost',
            'h-12 px-6': size === 'default',
            'h-16 px-8 text-base': size === 'large',
            'h-14 px-10 min-w-[140px]': size === 'touch',
          },
          className
        )}
        {...props}
      />
    );
  }
);

KioskButton.displayName = 'KioskButton';

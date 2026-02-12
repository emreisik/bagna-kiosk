import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../ui/utils';

interface KioskInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const KioskInput = forwardRef<HTMLInputElement, KioskInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-14 px-6 text-lg rounded-sm',
          'bg-white border-2 border-gray-200',
          'focus:outline-none focus:border-black',
          'transition-colors duration-200',
          'placeholder:text-gray-400',
          className
        )}
        {...props}
      />
    );
  }
);

KioskInput.displayName = 'KioskInput';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({
  size = 'default',
  className = '',
  message = '',
  textColor = 'text-amber-600 dark:text-amber-400',
  iconClassName,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-10 w-10',
    xl: 'h-16 w-16',
  };

  const messageTextColor = textColor
    .replace('text-amber-600', 'text-gray-600')
    .replace('dark:text-amber-400', 'dark:text-gray-400');

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2
        className={cn(
          'animate-spin',
          sizeClasses[size] || sizeClasses.default,
          textColor,
          iconClassName,
        )}
      />
      {message && (
        <p className={cn('mt-2 text-sm', messageTextColor)}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

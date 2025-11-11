import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * LoadingSpinner - Reusable loading spinner component
 * @param {Object} props
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 */
export default function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
      aria-label="Loading"
    />
  );
}


import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * ErrorMessage - Reusable error message component with optional retry
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {Function} props.onRetry - Optional retry callback
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showIcon - Whether to show error icon (default: true)
 */
export default function ErrorMessage({ 
  message, 
  onRetry, 
  className,
  showIcon = true 
}) {
  return (
    <Card className={cn('border-destructive', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showIcon && (
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-destructive font-medium">{message}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3"
                aria-label="Retry operation"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


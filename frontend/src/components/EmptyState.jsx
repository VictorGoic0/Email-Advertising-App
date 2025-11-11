import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * EmptyState - Reusable empty state component
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Icon component to display
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Optional action button/component
 * @param {string} props.className - Additional CSS classes
 */
export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {Icon && (
            <Icon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
}


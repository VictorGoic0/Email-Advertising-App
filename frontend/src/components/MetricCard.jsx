import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils.js';

/**
 * MetricCard component for displaying performance metrics
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main metric value to display
 * @param {string} props.subtitle - Subtitle/description text
 * @param {'green'|'yellow'|'red'|null} props.status - Status color (null for no color)
 * @param {string} props.className - Additional CSS classes
 */
export function MetricCard({ title, value, subtitle, status = null, className }) {
  // Determine border color based on status
  const getBorderColor = () => {
    if (status === null) return '';
    if (status === 'green') return 'border-green-500';
    if (status === 'yellow') return 'border-yellow-500';
    if (status === 'red') return 'border-red-500';
    return '';
  };

  // Determine status indicator color
  const getStatusIndicatorColor = () => {
    if (status === null) return '';
    if (status === 'green') return 'bg-green-500';
    if (status === 'yellow') return 'bg-yellow-500';
    if (status === 'red') return 'bg-red-500';
    return '';
  };

  return (
    <Card className={cn('relative', getBorderColor(), className)}>
      {status && (
        <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-xl', getStatusIndicatorColor())} />
      )}
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {subtitle && <CardDescription className="text-xs mt-1">{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to determine status color for uptime metrics
 * @param {number} uptimePercentage - Uptime percentage (0-100)
 * @returns {'green'|'yellow'|'red'}
 */
export function getUptimeStatus(uptimePercentage) {
  if (uptimePercentage > 99) return 'green';
  if (uptimePercentage >= 95) return 'yellow';
  return 'red';
}

/**
 * Helper function to determine status color for proof generation time
 * @param {number} averageTime - Average generation time in seconds
 * @returns {'green'|'yellow'|'red'}
 */
export function getProofGenerationStatus(averageTime) {
  if (averageTime < 5) return 'green';
  if (averageTime <= 20) return 'yellow';
  return 'red';
}

/**
 * Helper function to determine status color for approval rate
 * @param {number} approvalRate - Approval rate percentage (0-100)
 * @returns {'green'|'yellow'|'red'}
 */
export function getApprovalRateStatus(approvalRate) {
  if (approvalRate >= 80) return 'green';
  if (approvalRate > 50) return 'yellow';
  return 'red';
}


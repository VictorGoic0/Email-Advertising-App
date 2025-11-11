import { useEffect, useState } from 'react';
import { useMetrics } from '@/hooks/useMetrics';
import { MetricCard, getUptimeStatus, getProofGenerationStatus, getApprovalRateStatus } from '@/components/MetricCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SkeletonMetricCard } from '@/components/Skeleton';

/**
 * PerformanceDashboard component for displaying system performance metrics
 * @param {Object} props
 * @param {number} props.approvalRateDays - Number of days for approval rate (default: 7)
 * @param {Function} props.onApprovalRateDaysChange - Callback when approval rate days changes
 */
export function PerformanceDashboard({ approvalRateDays = 7, onApprovalRateDaysChange }) {
  const {
    uptimeMetrics,
    proofGenerationMetrics,
    queueDepth,
    approvalRateMetrics,
    loading,
    error,
    fetchAllMetrics,
    fetchApprovalRate,
  } = useMetrics();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all metrics on mount
  useEffect(() => {
    fetchAllMetrics(approvalRateDays);
  }, [fetchAllMetrics, approvalRateDays]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllMetrics(approvalRateDays);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchAllMetrics, approvalRateDays]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAllMetrics(approvalRateDays);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle approval rate days change
  const handleApprovalRateDaysChange = (days) => {
    if (onApprovalRateDaysChange) {
      onApprovalRateDaysChange(days);
    }
    fetchApprovalRate(days);
  };

  // Component name display mapping
  const componentNames = {
    api: 'API',
    s3: 'S3',
    database: 'Database',
    openai: 'OpenAI',
  };

  const isLoading = loading.uptime || loading.proofGeneration || loading.queueDepth || loading.approvalRate;
  const hasAnyData = uptimeMetrics && Object.keys(uptimeMetrics).length > 0;

  // Show skeleton on initial load
  if (isLoading && !hasAnyData) {
    return (
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Performance Metrics</h2>
            <p className="text-sm text-muted-foreground mt-1">Real-time system health and performance data</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={true}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Refresh
          </Button>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Metrics</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time system health and performance data</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', (isRefreshing || isLoading) && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Error messages */}
      {error.uptime && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          Error loading uptime metrics: {error.uptime}
        </div>
      )}
      {error.proofGeneration && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          Error loading proof generation metrics: {error.proofGeneration}
        </div>
      )}
      {error.queueDepth && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          Error loading queue depth: {error.queueDepth}
        </div>
      )}
      {error.approvalRate && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          Error loading approval rate: {error.approvalRate}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Uptime Metrics - 4 cards for each component */}
        {['api', 's3', 'database', 'openai'].map((component) => {
          const metrics = uptimeMetrics[component];
          const hasError = metrics?.error;
          const uptime = metrics?.uptime_percentage ?? 0;
          const status = hasError ? null : getUptimeStatus(uptime);

          return (
            <MetricCard
              key={component}
              title={`${componentNames[component]} Uptime`}
              value={hasError ? 'Error' : `${uptime.toFixed(2)}%`}
              subtitle={
                hasError
                  ? 'Failed to load'
                  : `${metrics?.healthy_checks || 0}/${metrics?.total_checks || 0} healthy checks`
              }
              status={status}
            />
          );
        })}

        {/* Proof Generation Metrics */}
        <MetricCard
          title="Proof Generation"
          value={
            loading.proofGeneration
              ? '...'
              : proofGenerationMetrics
                ? `${proofGenerationMetrics.average.toFixed(2)}s`
                : 'No data'
          }
          subtitle={
            proofGenerationMetrics
              ? `Avg: ${proofGenerationMetrics.average.toFixed(2)}s | P95: ${proofGenerationMetrics.p95.toFixed(2)}s`
              : 'No generations yet'
          }
          status={
            proofGenerationMetrics
              ? getProofGenerationStatus(proofGenerationMetrics.average)
              : null
          }
        />

        {/* Queue Depth */}
        <MetricCard
          title="Queue Depth"
          value={loading.queueDepth ? '...' : queueDepth !== null ? queueDepth : 'No data'}
          subtitle="Campaigns pending approval"
          status={null}
        />

        {/* Approval Rate */}
        <div className="md:col-span-2 lg:col-span-1">
          <MetricCard
            title={
              <div className="flex items-center justify-between w-full">
                <span>Approval Rate</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      {approvalRateDays} days
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleApprovalRateDaysChange(7)}>
                      7 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleApprovalRateDaysChange(30)}>
                      30 days
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
            value={
              loading.approvalRate
                ? '...'
                : approvalRateMetrics
                  ? `${approvalRateMetrics.approval_rate.toFixed(1)}%`
                  : 'No data'
            }
            subtitle={
              approvalRateMetrics
                ? `${approvalRateMetrics.approved_count} approved, ${approvalRateMetrics.rejected_count} rejected`
                : 'No reviews yet'
            }
            status={
              approvalRateMetrics
                ? getApprovalRateStatus(approvalRateMetrics.approval_rate)
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}


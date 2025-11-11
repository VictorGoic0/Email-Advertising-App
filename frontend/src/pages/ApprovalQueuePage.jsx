import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ApprovalQueue from '@/components/ApprovalQueue';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Skeleton, SkeletonCard } from '@/components/Skeleton';

/**
 * ApprovalQueuePage - Page for campaign managers to view and manage approval queue
 */
export default function ApprovalQueuePage() {
  const location = useLocation();
  const { fetchApprovalQueue } = useCampaigns();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success message from navigation state and refresh queue
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      // Refresh the queue to remove the approved/rejected campaign
      loadQueue();
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchApprovalQueue();
      setCampaigns(data || []);
    } catch (err) {
      console.error('Failed to load approval queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await loadQueue();
  };

  const isApproved = successMessage.includes('approved');
  const isRejected = successMessage.includes('rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approval Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending campaigns
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className={isApproved 
          ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/10" 
          : "border-red-500/20 bg-red-50/50 dark:bg-red-950/10"
        }>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {isApproved ? (
                <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
              )}
              <p className={`text-sm font-medium ${isApproved 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-red-700 dark:text-red-400'
              }`}>
                {successMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Count */}
      {!loading && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{campaigns.length}</span>{' '}
              {campaigns.length === 1 ? 'campaign' : 'campaigns'} pending approval
            </p>
          </CardContent>
        </Card>
      )}

      {/* Approval Queue */}
      {loading && campaigns.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <ApprovalQueue campaigns={campaigns} loading={loading} onRefresh={handleRefresh} />
      )}
    </div>
  );
}


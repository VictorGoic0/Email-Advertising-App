import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ApprovalQueue from '@/components/ApprovalQueue';
import { useCampaigns } from '@/hooks/useCampaigns';

/**
 * ApprovalQueuePage - Page for campaign managers to view and manage approval queue
 */
export default function ApprovalQueuePage() {
  const { fetchApprovalQueue } = useCampaigns();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

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
      <ApprovalQueue campaigns={campaigns} loading={loading} onRefresh={handleRefresh} />
    </div>
  );
}


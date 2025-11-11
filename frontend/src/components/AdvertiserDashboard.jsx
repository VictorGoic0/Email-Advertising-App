import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Skeleton } from '@/components/Skeleton';

/**
 * AdvertiserDashboard component - displays quick stats and recent campaigns for advertisers
 */
export default function AdvertiserDashboard() {
  const navigate = useNavigate();
  const { campaigns, loading, fetchCampaigns } = useCampaigns();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Calculate stats from campaigns
  const totalCampaigns = campaigns.length;
  const approvedCampaigns = campaigns.filter((c) => c.status === 'approved').length;
  const pendingCampaigns = campaigns.filter(
    (c) => c.status === 'pending_approval' || c.status === 'draft'
  ).length;

  // Get recent campaigns (last 5, sorted by created_at)
  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        label: 'Draft',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      },
      pending_approval: {
        label: 'Pending Approval',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      approved: {
        label: 'Approved',
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      rejected: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // Show skeleton loader on initial load
  if (loading && campaigns.length === 0) {
    return (
      <div className="space-y-6">
        {/* Quick Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Recent Campaigns Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Campaigns</CardDescription>
            <CardTitle className="text-3xl">{totalCampaigns}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{approvedCampaigns}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pendingCampaigns}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your most recently created campaigns</CardDescription>
            </div>
            <Button onClick={() => navigate('/campaigns/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No campaigns yet. Create your first campaign to get started.
              </p>
              <Button onClick={() => navigate('/campaigns/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/campaigns/${campaign.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View campaign: ${campaign.campaign_name}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{campaign.campaign_name}</h4>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(campaign.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/campaigns/${campaign.id}`);
                    }}
                    className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`View campaign: ${campaign.campaign_name}`}
                  >
                    View
                  </Button>
                </div>
              ))}
              {campaigns.length > 5 && (
                <div className="pt-2 border-t border-border">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/campaigns">View All Campaigns</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


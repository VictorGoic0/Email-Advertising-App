import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCampaigns } from '@/hooks/useCampaigns';

/**
 * CampaignList component for displaying campaigns
 */
export default function CampaignList({ statusFilter = null }) {
  const navigate = useNavigate();
  const { campaigns, loading, error, fetchCampaigns } = useCampaigns();

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

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
        className={cn(
          'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
          config.className
        )}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/campaigns/${campaignId}`);
  };

  // Filter campaigns by status if provided
  const filteredCampaigns = statusFilter
    ? campaigns.filter((c) => c.status === statusFilter)
    : campaigns;

  if (loading && campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading campaigns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (filteredCampaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              {statusFilter
                ? `No campaigns with status "${statusFilter}" found.`
                : 'No campaigns found. Create your first campaign to get started.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCampaigns.map((campaign) => (
        <Card
          key={campaign.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCampaignClick(campaign.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg line-clamp-2">{campaign.campaign_name}</CardTitle>
              {getStatusBadge(campaign.status)}
            </div>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {formatDate(campaign.created_at)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {campaign.target_audience && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Target Audience</p>
                  <p className="text-sm line-clamp-2">{campaign.target_audience}</p>
                </div>
              )}
              {campaign.campaign_goal && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Goal</p>
                  <p className="text-sm line-clamp-2">{campaign.campaign_goal}</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={(e) => {
                e.stopPropagation();
                handleCampaignClick(campaign.id);
              }}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


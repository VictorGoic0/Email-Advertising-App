import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useCampaigns';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

/**
 * ApprovalQueue component for displaying pending campaigns
 * @param {Object} props
 * @param {Array} props.campaigns - Array of campaigns to display
 * @param {boolean} props.loading - Whether data is loading
 * @param {Function} props.onRefresh - Optional callback when queue should be refreshed
 */
export default function ApprovalQueue({ campaigns = [], loading = false, onRefresh }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // If campaigns prop is not provided, fetch them ourselves (backward compatibility)
  const { fetchApprovalQueue } = useCampaigns();
  const [internalCampaigns, setInternalCampaigns] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const isControlled = campaigns !== undefined && loading !== undefined;
  const displayCampaigns = isControlled ? campaigns : internalCampaigns;
  const displayLoading = isControlled ? loading : internalLoading;

  useEffect(() => {
    if (!isControlled) {
      const loadQueue = async () => {
        setInternalLoading(true);
        setError(null);
        try {
          const data = await fetchApprovalQueue();
          setInternalCampaigns(data || []);
        } catch (err) {
          setError(err.message || 'Failed to load approval queue');
        } finally {
          setInternalLoading(false);
        }
      };
      loadQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/approval-queue/${campaignId}`);
  };

  // Create thumbnail preview from HTML (simple approach - show first image or placeholder)
  const getThumbnail = (html) => {
    if (!html) return null;
    
    // Try to extract first image src
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    
    return null;
  };

  if (displayLoading && displayCampaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading approval queue...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => {
          if (!isControlled) {
            const loadQueue = async () => {
              setInternalLoading(true);
              setError(null);
              try {
                const data = await fetchApprovalQueue();
                setInternalCampaigns(data || []);
              } catch (err) {
                setError(err.message || 'Failed to load approval queue');
              } finally {
                setInternalLoading(false);
              }
            };
            loadQueue();
          } else if (onRefresh) {
            onRefresh();
          }
        }}
      />
    );
  }

  if (displayCampaigns.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No campaigns pending approval"
        description="The approval queue is empty. All campaigns have been reviewed."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayCampaigns.map((campaign) => {
        const thumbnail = getThumbnail(campaign.generated_email_html);
        
        return (
          <Card
            key={campaign.id}
            className="cursor-pointer hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            onClick={() => handleCampaignClick(campaign.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCampaignClick(campaign.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Review campaign: ${campaign.campaign_name}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 flex-1">
                  {campaign.campaign_name}
                </CardTitle>
              </div>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs">
                  <User className="h-3 w-3" />
                  Advertiser ID: {campaign.advertiser_id.slice(0, 8)}...
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Thumbnail Preview */}
              {thumbnail ? (
                <div className="mb-4 rounded-md overflow-hidden border border-border bg-muted">
                  <img
                    src={thumbnail}
                    alt="Email preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : campaign.generated_email_html ? (
                <div className="mb-4 rounded-md border border-border bg-muted h-32 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Submitted: {formatDate(campaign.created_at)}
                </div>
                {campaign.target_audience && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Target Audience</p>
                    <p className="text-sm line-clamp-2">{campaign.target_audience}</p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCampaignClick(campaign.id);
                }}
                aria-label={`Review campaign: ${campaign.campaign_name}`}
              >
                Review Campaign
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';

/**
 * EmailPreviewPage - Placeholder for email preview (will be fully implemented in PR #13)
 */
export default function EmailPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaign, loading, error, fetchCampaign } = useCampaigns();

  useEffect(() => {
    if (id) {
      fetchCampaign(id);
    }
  }, [id, fetchCampaign]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading campaign...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Campaign not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{campaign.campaign_name}</h1>
          <p className="text-muted-foreground mt-1">Email Preview</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Email preview functionality will be implemented in PR #13
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


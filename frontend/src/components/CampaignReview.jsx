import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';
import EmailPreview from '@/components/EmailPreview';
import RejectionModal from '@/components/RejectionModal';

/**
 * CampaignReview component for reviewing and approving/rejecting campaigns
 * @param {Object} props
 * @param {string} props.campaignId - The ID of the campaign to review
 */
export default function CampaignReview({ campaignId }) {
  const navigate = useNavigate();
  const {
    campaign,
    loading,
    error,
    fetchCampaign,
    approveCampaign,
    rejectCampaign,
  } = useCampaigns();

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (campaignId) {
      fetchCampaign(campaignId);
    }
  }, [campaignId, fetchCampaign]);

  const handleApprove = async () => {
    if (!campaignId) return;

    setApproving(true);
    setActionError('');
    setSuccessMessage('');

    try {
      await approveCampaign(campaignId);
      setSuccessMessage('Campaign approved successfully!');
      
      // Navigate back to approval queue after a short delay
      setTimeout(() => {
        navigate('/approval-queue');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.detail || err.message || 'Failed to approve campaign');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!campaignId) return;

    setRejecting(true);
    setActionError('');
    setSuccessMessage('');
    setShowRejectionModal(false);

    try {
      await rejectCampaign(campaignId, rejectionReason);
      setSuccessMessage('Campaign rejected successfully!');
      
      // Navigate back to approval queue after a short delay
      setTimeout(() => {
        navigate('/approval-queue');
      }, 1500);
    } catch (err) {
      setActionError(err.response?.data?.detail || err.message || 'Failed to reject campaign');
      setRejecting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !campaign) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading campaign details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !campaign) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/approval-queue')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Approval Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Campaign not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/approval-queue')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Approval Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasGeneratedEmail = campaign.generated_email_html && campaign.generated_email_mjml;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{campaign.campaign_name}</h1>
          <p className="text-muted-foreground mt-1">Campaign Review</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/approval-queue')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="p-4">
            <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {actionError && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{actionError}</p>
          </CardContent>
        </Card>
      )}

      {/* Campaign Information */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Advertiser ID</p>
              <p className="text-sm mt-1 flex items-center gap-2">
                <User className="h-4 w-4" />
                {campaign.advertiser_id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(campaign.created_at)}
              </p>
            </div>
          </div>

          {campaign.target_audience && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Target Audience</p>
              <p className="text-sm mt-1">{campaign.target_audience}</p>
            </div>
          )}

          {campaign.campaign_goal && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Campaign Goal</p>
              <p className="text-sm mt-1">{campaign.campaign_goal}</p>
            </div>
          )}

          {campaign.additional_notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
              <p className="text-sm mt-1">{campaign.additional_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preview */}
      {hasGeneratedEmail ? (
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>Review the generated email before approving or rejecting</CardDescription>
          </CardHeader>
          <CardContent>
            <EmailPreview emailHtml={campaign.generated_email_html} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/10">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              This campaign does not have a generated email proof. Please ask the advertiser to generate one before reviewing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => setShowRejectionModal(true)}
              disabled={approving || rejecting}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Campaign
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approving || rejecting || !hasGeneratedEmail}
              className="flex-1"
            >
              {approving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Campaign
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      <RejectionModal
        open={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleReject}
        loading={rejecting}
      />
    </div>
  );
}


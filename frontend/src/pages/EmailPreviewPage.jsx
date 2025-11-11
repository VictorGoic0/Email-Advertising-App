import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles, RefreshCw, Send, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';
import EmailPreview from '@/components/EmailPreview';

/**
 * EmailPreviewPage - Full email preview page with generation and submission
 */
export default function EmailPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    campaign,
    loading,
    error,
    generatingProof,
    proofError,
    fetchCampaign,
    generateProof,
    submitCampaign,
  } = useCampaigns();

  const [generationTime, setGenerationTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCampaign(id);
    }
  }, [id, fetchCampaign]);

  const handleGenerateProof = async () => {
    if (!id) return;
    
    setGenerationTime(null);
    setSubmitError(null);
    try {
      const result = await generateProof(id);
      setGenerationTime(result.generation_time);
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to generate proof:', err);
    }
  };

  const handleRegenerate = async () => {
    await handleGenerateProof();
  };

  const handleSubmitForApproval = async () => {
    if (!id) return;
    
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitCampaign(id);
      // Redirect to My Campaigns after successful submission
      navigate('/campaigns');
    } catch (err) {
      setSubmitError(err.response?.data?.detail || err.message || 'Failed to submit campaign');
      console.error('Failed to submit campaign:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAsDraft = () => {
    // Save as draft is essentially just navigating away
    // The campaign is already saved as draft by default
    navigate('/campaigns');
  };

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

  const hasGeneratedEmail = campaign.generated_email_html && campaign.generated_email_mjml;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Generation Controls */}
      {!hasGeneratedEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Email Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate an email proof for this campaign. This will use AI to create an email
              template based on your campaign details and assets.
            </p>
            {proofError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{proofError}</p>
              </div>
            )}
            <Button
              onClick={handleGenerateProof}
              disabled={generatingProof}
              className="w-full sm:w-auto"
            >
              {generatingProof ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Email Proof
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generation Status */}
      {generatingProof && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Generating email proof... This may take a few moments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Time Display */}
      {generationTime && !generatingProof && (
        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              Email proof generated successfully in {generationTime} seconds
            </p>
          </CardContent>
        </Card>
      )}

      {/* Email Preview */}
      {hasGeneratedEmail && !generatingProof && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={generatingProof}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EmailPreview emailHtml={campaign.generated_email_html} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={submitting}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={submitting || campaign.status !== 'draft'}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </div>
              {submitError && (
                <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}
              {campaign.status !== 'draft' && (
                <p className="mt-4 text-sm text-muted-foreground">
                  This campaign has already been submitted. Status: {campaign.status}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

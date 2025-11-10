import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAssets } from '@/hooks/useAssets';
import { useCampaigns } from '@/hooks/useCampaigns';
import AssetReview from '@/components/AssetReview';
import CampaignForm from '@/components/CampaignForm';

const STEPS = {
  ASSETS: 'assets',
  DETAILS: 'details',
};

/**
 * CreateCampaignPage - Main page for campaign creation workflow
 */
export default function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.ASSETS);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [deletingAssetId, setDeletingAssetId] = useState(null);

  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
    fetchAssets,
    deleteAsset,
  } = useAssets();

  const {
    createCampaign,
    loading: campaignLoading,
    error: campaignError,
  } = useCampaigns();

  // Fetch assets on mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleDelete = async (assetId) => {
    setDeletingAssetId(assetId);
    try {
      await deleteAsset(assetId);
      // Remove from selected if it was selected
      setSelectedAssetIds((prev) => prev.filter((id) => id !== assetId));
      await fetchAssets();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingAssetId(null);
    }
  };

  const handleAssetToggle = (assetId) => {
    setSelectedAssetIds((prev) => {
      if (prev.includes(assetId)) {
        return prev.filter((id) => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  };

  const handleCampaignSubmit = async (campaignData) => {
    if (selectedAssetIds.length === 0) {
      alert('Please select at least one asset for your campaign');
      return;
    }

    try {
      const campaign = await createCampaign({
        ...campaignData,
        asset_ids: selectedAssetIds,
      });
      
      // Redirect to email preview page
      navigate(`/campaigns/${campaign.id}`);
    } catch (err) {
      console.error('Campaign creation failed:', err);
      // Error is handled by useCampaigns hook
    }
  };

  const getStepProgress = () => {
    const steps = [
      { id: STEPS.ASSETS, label: 'Select Assets', icon: Upload },
      { id: STEPS.DETAILS, label: 'Campaign Details', icon: FileText },
    ];
    return steps;
  };

  const steps = getStepProgress();
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const isClickable = index <= currentStepIndex;

              // Prevent navigation to details step if no assets selected
              const canNavigate = step.id === STEPS.DETAILS 
                ? isClickable && selectedAssetIds.length > 0
                : isClickable;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => {
                      if (canNavigate) {
                        if (step.id === STEPS.DETAILS && selectedAssetIds.length === 0) {
                          return; // Prevent navigation
                        }
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={!canNavigate}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${isActive ? 'bg-primary text-primary-foreground' : ''}
                      ${isCompleted && !isActive ? 'text-primary' : ''}
                      ${!isActive && !isCompleted ? 'text-muted-foreground' : ''}
                      ${canNavigate ? 'cursor-pointer hover:bg-accent' : 'cursor-not-allowed'}
                    `}
                  >
                    <StepIcon className="h-5 w-5" />
                    <span className="font-medium">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-2 transition-colors
                        ${isCompleted ? 'bg-primary' : 'bg-border'}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(assetsError || campaignError) && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">
              {assetsError || campaignError}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === STEPS.ASSETS && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Select Assets</h2>
            <p className="text-muted-foreground">
              Select assets to include in your campaign
            </p>
          </div>

          {assets.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Assets</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAssetIds.length} of {assets.length} selected
                </p>
              </div>
              <AssetReview
                assets={assets}
                onDelete={handleDelete}
                loading={assetsLoading}
                deletingAssetId={deletingAssetId}
                selectable={true}
                selectedAssetIds={selectedAssetIds}
                onAssetToggle={handleAssetToggle}
              />
              {selectedAssetIds.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(STEPS.DETAILS)}>
                    Continue to Details ({selectedAssetIds.length} asset{selectedAssetIds.length !== 1 ? 's' : ''} selected)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-muted-foreground">
                  No assets available. Please upload assets first.
                </p>
                <Button asChild variant="outline">
                  <Link to="/assets">Go to Asset Upload</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {currentStep === STEPS.DETAILS && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Campaign Details</h2>
              <p className="text-muted-foreground">
                Provide information about your campaign
              </p>
            </div>
            <Button variant="outline" onClick={() => setCurrentStep(STEPS.ASSETS)}>
              Back to Assets
            </Button>
          </div>

          {selectedAssetIds.length === 0 ? (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-destructive">
                  Please select at least one asset before continuing
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setCurrentStep(STEPS.ASSETS)}
                >
                  Go Back to Select Assets
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Assets:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAssetIds.length} asset{selectedAssetIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <CampaignForm
                onSubmit={handleCampaignSubmit}
                isLoading={campaignLoading}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}


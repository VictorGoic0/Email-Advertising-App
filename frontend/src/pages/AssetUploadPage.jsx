import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAssets } from '@/hooks/useAssets';
import AssetUpload from '@/components/AssetUpload';
import AssetReview from '@/components/AssetReview';
import CategoryZone from '@/components/CategoryZone';

const STEPS = {
  UPLOAD: 'upload',
  REVIEW: 'review',
  ORGANIZE: 'organize',
};

/**
 * AssetUploadPage - Main page for asset upload workflow
 */
export default function AssetUploadPage() {
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [deletingAssetId, setDeletingAssetId] = useState(null);

  const {
    assets,
    loading,
    error,
    fetchAssets,
    uploadAsset,
    deleteAsset,
    recategorizeAssets,
    updateAssetCategory,
  } = useAssets();

  // Fetch assets on mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleUpload = async (file, onProgress) => {
    try {
      await uploadAsset(file, onProgress);
      // Auto-advance to review step after successful upload
      if (currentStep === STEPS.UPLOAD) {
        setCurrentStep(STEPS.REVIEW);
      }
      // Refresh assets list
      await fetchAssets();
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  };

  const handleDelete = async (assetId) => {
    setDeletingAssetId(assetId);
    try {
      await deleteAsset(assetId);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingAssetId(null);
    }
  };

  const handleRecategorize = async (assetIds) => {
    try {
      await recategorizeAssets(assetIds);
      await fetchAssets(); // Refresh to get updated categories
    } catch (err) {
      console.error('Recategorize failed:', err);
      throw err;
    }
  };

  const handleCategoryUpdate = async (assetId, category) => {
    try {
      await updateAssetCategory(assetId, category);
      await fetchAssets(); // Refresh to get updated categories
    } catch (err) {
      console.error('Category update failed:', err);
      throw err;
    }
  };

  const getStepProgress = () => {
    const steps = [
      { id: STEPS.UPLOAD, label: 'Upload', icon: Upload },
      { id: STEPS.REVIEW, label: 'Review', icon: CheckCircle2 },
      { id: STEPS.ORGANIZE, label: 'Organize', icon: Grid3x3 },
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

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    disabled={!isClickable}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${isActive ? 'bg-primary text-primary-foreground' : ''}
                      ${isCompleted && !isActive ? 'text-primary' : ''}
                      ${!isActive && !isCompleted ? 'text-muted-foreground' : ''}
                      ${isClickable ? 'cursor-pointer hover:bg-accent' : 'cursor-not-allowed'}
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
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === STEPS.UPLOAD && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Upload Assets</h2>
            <p className="text-muted-foreground">
              Upload your logos, images, text files, and URLs to get started
            </p>
          </div>
          <AssetUpload onUpload={handleUpload} disabled={loading} />
          {assets.length > 0 && (
            <div className="mt-6">
              <Button onClick={() => setCurrentStep(STEPS.REVIEW)}>
                Continue to Review ({assets.length} asset{assets.length !== 1 ? 's' : ''})
              </Button>
            </div>
          )}
        </div>
      )}

      {currentStep === STEPS.REVIEW && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Assets</h2>
              <p className="text-muted-foreground">
                Review your uploaded assets and recategorize if needed
              </p>
            </div>
            <Button variant="outline" onClick={() => setCurrentStep(STEPS.UPLOAD)}>
              Upload More
            </Button>
          </div>
          <AssetReview
            assets={assets}
            onDelete={handleDelete}
            onRecategorize={handleRecategorize}
            loading={loading}
            deletingAssetId={deletingAssetId}
          />
          {assets.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(STEPS.ORGANIZE)}>
                Continue to Organize
              </Button>
            </div>
          )}
        </div>
      )}

      {currentStep === STEPS.ORGANIZE && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Organize Assets</h2>
              <p className="text-muted-foreground">
                Drag and drop assets into the correct category zones
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(STEPS.UPLOAD)}>
                Upload More
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(STEPS.REVIEW)}>
                Back to Review
              </Button>
            </div>
          </div>
          <CategoryZone
            assets={assets}
            onCategoryUpdate={handleCategoryUpdate}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}


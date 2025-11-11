import { useEffect, useState } from 'react';
import { Sparkles, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils.js';
import AssetCard from './AssetCard';
import EmptyState from '@/components/EmptyState';

/**
 * AssetReview component for reviewing and managing uploaded assets
 */
export default function AssetReview({
  assets,
  onDelete,
  onRecategorize,
  loading,
  deletingAssetId,
  selectable = false,
  selectedAssetIds = [],
  onAssetToggle = null,
}) {
  const [internalSelectedAssets, setInternalSelectedAssets] = useState([]);
  const [isRecategorizing, setIsRecategorizing] = useState(false);
  const [groupedAssets, setGroupedAssets] = useState({});

  // Use controlled selection if provided, otherwise use internal state
  const selectedAssets = selectable && onAssetToggle ? selectedAssetIds : internalSelectedAssets;

  // Group assets by category
  useEffect(() => {
    const grouped = assets.reduce((acc, asset) => {
      const category = asset.category || 'pending';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(asset);
      return acc;
    }, {});

    setGroupedAssets(grouped);
  }, [assets]);

  const handleToggleSelect = (assetId) => {
    if (selectable && onAssetToggle) {
      // Controlled mode - call parent handler
      onAssetToggle(assetId);
    } else {
      // Internal state mode
      setInternalSelectedAssets((prev) =>
        prev.includes(assetId)
          ? prev.filter((id) => id !== assetId)
          : [...prev, assetId]
      );
    }
  };

  const handleSelectAll = () => {
    if (selectable && onAssetToggle) {
      // Controlled mode - toggle each asset
      if (selectedAssets.length === assets.length) {
        assets.forEach((asset) => onAssetToggle(asset.id));
      } else {
        assets.forEach((asset) => {
          if (!selectedAssets.includes(asset.id)) {
            onAssetToggle(asset.id);
          }
        });
      }
    } else {
      // Internal state mode
      if (internalSelectedAssets.length === assets.length) {
        setInternalSelectedAssets([]);
      } else {
        setInternalSelectedAssets(assets.map((asset) => asset.id));
      }
    }
  };

  const handleRecategorize = async () => {
    if (selectedAssets.length === 0 || !onRecategorize) return;

    setIsRecategorizing(true);
    try {
      await onRecategorize(selectedAssets);
      if (!selectable) {
        // Only clear internal state if not in controlled mode
        setInternalSelectedAssets([]);
      }
    } catch (err) {
      console.error('Failed to recategorize assets:', err);
    } finally {
      setIsRecategorizing(false);
    }
  };


  if (loading && assets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading assets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <EmptyState
        icon={Upload}
        title="No assets uploaded yet"
        description="Upload some files to get started with your campaigns."
      />
    );
  }

  const categories = ['logo', 'image', 'copy', 'url', 'pending'];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Review Assets</CardTitle>
              <CardDescription>
                {assets.length} asset{assets.length !== 1 ? 's' : ''} uploaded
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!selectable && selectedAssets.length > 0 && onRecategorize && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecategorize}
                  disabled={isRecategorizing}
                >
                  {isRecategorizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recategorizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Recategorize with AI ({selectedAssets.length})
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isRecategorizing}
              >
                {selectedAssets.length === assets.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assets by Category */}
      {categories.map((category) => {
        const categoryAssets = groupedAssets[category] || [];
        if (categoryAssets.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold capitalize">{category}</h3>
              <span className="text-sm text-muted-foreground">
                ({categoryAssets.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryAssets.map((asset) => (
                <div key={asset.id} className="relative">
                  <div
                    className={cn(
                      'absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded p-1',
                      selectedAssets.includes(asset.id) && 'ring-2 ring-primary'
                    )}
                  >
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => handleToggleSelect(asset.id)}
                    />
                  </div>
                  <AssetCard
                    asset={asset}
                    onDelete={onDelete}
                    isDeleting={deletingAssetId === asset.id}
                    draggable={true}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


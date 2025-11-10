import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import AssetCard from './AssetCard';

/**
 * AssetReview component for reviewing and managing uploaded assets
 */
export default function AssetReview({
  assets,
  onDelete,
  onRecategorize,
  loading,
  deletingAssetId,
}) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [isRecategorizing, setIsRecategorizing] = useState(false);
  const [groupedAssets, setGroupedAssets] = useState({});

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
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((asset) => asset.id));
    }
  };

  const handleRecategorize = async () => {
    if (selectedAssets.length === 0) return;

    setIsRecategorizing(true);
    try {
      await onRecategorize(selectedAssets);
      setSelectedAssets([]);
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
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              No assets uploaded yet. Upload some files to get started.
            </p>
          </div>
        </CardContent>
      </Card>
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
              {selectedAssets.length > 0 && (
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


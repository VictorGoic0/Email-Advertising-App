import { useState, useCallback } from 'react';
import { Image, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'logo', label: 'Logos', icon: Image, color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { id: 'image', label: 'Images', icon: Image, color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { id: 'copy', label: 'Copy', icon: FileText, color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { id: 'url', label: 'URLs', icon: LinkIcon, color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
];

/**
 * CategoryZone component with drag-and-drop zones for each category
 */
export default function CategoryZone({ assets, onCategoryUpdate, loading = false }) {
  const [draggedAssetId, setDraggedAssetId] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const [updatingAssetId, setUpdatingAssetId] = useState(null);

  const handleDragStart = useCallback((e, assetId) => {
    setDraggedAssetId(assetId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a small delay to allow drag state to be set
    setTimeout(() => {}, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedAssetId(null);
    setDragOverCategory(null);
  }, []);

  const handleDragOver = useCallback((e, categoryId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryId);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCategory(null);
    }
  }, []);

  const handleDrop = useCallback(
    async (e, categoryId) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get asset ID from dataTransfer (for external drags) or from state (for internal drags)
      const assetId = e.dataTransfer.getData('text/plain') || draggedAssetId;
      
      if (!assetId) return;

      const asset = assets.find((a) => a.id === assetId);
      if (!asset || asset.category === categoryId) {
        setDraggedAssetId(null);
        setDragOverCategory(null);
        return;
      }

      setUpdatingAssetId(assetId);
      try {
        await onCategoryUpdate(assetId, categoryId);
      } catch (err) {
        console.error('Failed to update category:', err);
      } finally {
        setUpdatingAssetId(null);
        setDraggedAssetId(null);
        setDragOverCategory(null);
      }
    },
    [draggedAssetId, assets, onCategoryUpdate]
  );

  const getAssetsForCategory = (categoryId) => {
    return assets.filter((asset) => asset.category === categoryId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organize Assets by Category</CardTitle>
          <CardDescription>
            Drag assets from the review section into the appropriate category zones below
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const categoryAssets = getAssetsForCategory(category.id);
          const isDragOver = dragOverCategory === category.id;

          return (
            <Card
              key={category.id}
              className={cn(
                'transition-all min-h-[300px]',
                isDragOver && 'ring-2 ring-primary ring-offset-2',
                category.color
              )}
              onDragOver={(e) => handleDragOver(e, category.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, category.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{category.label}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    ({categoryAssets.length})
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {categoryAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-border rounded-lg">
                    <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isDragOver
                        ? 'Drop here'
                        : 'Drag assets here'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categoryAssets.map((asset) => (
                      <div
                        key={asset.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, asset.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-md bg-background border border-border cursor-move transition-all',
                          draggedAssetId === asset.id && 'opacity-50',
                          updatingAssetId === asset.id && 'opacity-50'
                        )}
                      >
                        {updatingAssetId === asset.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm flex-1 truncate" title={asset.filename}>
                          {asset.filename}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


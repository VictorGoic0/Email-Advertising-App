import { useState } from 'react';
import { Trash2, FileText, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * AssetCard component for displaying individual assets
 */
export default function AssetCard({ asset, onDelete, isDeleting = false, draggable = false }) {
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'logo':
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'copy':
        return <FileText className="h-4 w-4" />;
      case 'url':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'logo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'image':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'copy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'url':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = asset.file_type?.startsWith('image/') || 
                  asset.category === 'logo' || 
                  asset.category === 'image';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && !isDeleting) {
      onDelete(asset.id);
    }
  };

  const handleDragStart = (e) => {
    if (!draggable) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', asset.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'group relative overflow-hidden transition-all hover:shadow-md',
        isDeleting && 'opacity-50',
        isDragging && 'opacity-50',
        draggable && 'cursor-move'
      )}
    >
      <CardContent className="p-0">
        {/* Image Preview */}
        {isImage && !imageError && (
          <div
            className="relative w-full h-48 bg-muted overflow-hidden cursor-pointer"
            onClick={() => setShowPreview(!showPreview)}
          >
            <img
              src={asset.s3_url}
              alt={asset.filename}
              className={cn(
                'w-full h-full object-cover transition-transform',
                showPreview ? 'scale-110' : 'group-hover:scale-105'
              )}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        )}

        {/* Text Preview */}
        {asset.category === 'copy' && !isImage && (
          <div className="w-full h-48 bg-muted p-4 flex items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* URL Preview */}
        {asset.category === 'url' && (
          <div className="w-full h-48 bg-muted p-4 flex items-center justify-center">
            <LinkIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Fallback for images that failed to load */}
        {isImage && imageError && (
          <div className="w-full h-48 bg-muted p-4 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Filename and Category */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm line-clamp-2" title={asset.filename}>
              {asset.filename}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
                  getCategoryColor(asset.category)
                )}
              >
                {getCategoryIcon(asset.category)}
                {asset.category}
              </span>
            </div>
          </div>

          {/* File Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{formatFileSize(asset.file_size_bytes)}</p>
            {asset.categorization_method && (
              <p className="capitalize">
                {asset.categorization_method === 'ai' ? 'AI' : asset.categorization_method} categorized
              </p>
            )}
          </div>

          {/* Delete Button */}
          <div className="flex justify-end pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import { useState, useRef, useCallback } from 'react';
import { Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils.js';

/**
 * AssetUpload component with drag-and-drop functionality
 */
export default function AssetUpload({ onUpload, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    [disabled]
  );

  const handleFileSelect = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await handleFiles(files);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    []
  );

  const handleFiles = async (files) => {
    setUploadError(null);
    setUploadSuccess(false);

    for (const file of files) {
      try {
        setUploadProgress(0);
        await onUpload(file, (progress) => {
          setUploadProgress(progress);
        });
        setUploadProgress(null);
        setUploadSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err) {
        setUploadProgress(null);
        setUploadError(err.message || 'Failed to upload file');
        // Clear error after 5 seconds
        setTimeout(() => setUploadError(null), 5000);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'cursor-pointer'
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />

          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div
              className={cn(
                'rounded-full p-4',
                isDragging ? 'bg-primary/10' : 'bg-muted'
              )}
            >
              <Upload
                className={cn(
                  'h-8 w-8',
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                )}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragging
                  ? 'Drop files here'
                  : 'Drag and drop files here, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports logos, images, text files, and URLs
              </p>
            </div>

            {uploadProgress !== null && (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <File className="h-4 w-4" />
                <span>File uploaded successfully!</span>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <X className="h-4 w-4" />
                <span>{uploadError}</span>
              </div>
            )}

            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Select Files
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


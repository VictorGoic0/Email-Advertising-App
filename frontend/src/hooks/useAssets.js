import { useState, useCallback } from 'react';
import apiClient from '@/lib/axios.js';

/**
 * Custom hook for managing assets
 * Provides functions for fetching, uploading, deleting, recategorizing, and updating assets
 */
export function useAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all assets for the current user
   */
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/assets');
      setAssets(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch assets';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload a new asset file
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Optional progress callback
   */
  const uploadAsset = useCallback(async (file, onProgress) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/assets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      const newAsset = response.data;
      setAssets((prev) => [...prev, newAsset]);
      return newAsset;
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload asset';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an asset
   * @param {string} assetId - The ID of the asset to delete
   */
  const deleteAsset = useCallback(async (assetId) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/assets/${assetId}`);
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete asset';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recategorize assets using AI
   * @param {string[]} assetIds - Array of asset IDs to recategorize
   */
  const recategorizeAssets = useCallback(async (assetIds) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/assets/recategorize', {
        asset_ids: assetIds,
      });

      const updatedAssets = response.data;
      
      // Update assets in state
      setAssets((prev) =>
        prev.map((asset) => {
          const updated = updatedAssets.find((a) => a.id === asset.id);
          return updated || asset;
        })
      );

      return updatedAssets;
    } catch (err) {
      const errorMessage = err.message || 'Failed to recategorize assets';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Manually update an asset's category
   * @param {string} assetId - The ID of the asset to update
   * @param {string} category - The new category
   */
  const updateAssetCategory = useCallback(async (assetId, category) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/assets/${assetId}/category`, {
        category,
      });

      const updatedAsset = response.data;
      
      // Update asset in state
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetId ? updatedAsset : asset
        )
      );

      return updatedAsset;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update asset category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assets,
    loading,
    error,
    fetchAssets,
    uploadAsset,
    deleteAsset,
    recategorizeAssets,
    updateAssetCategory,
  };
}


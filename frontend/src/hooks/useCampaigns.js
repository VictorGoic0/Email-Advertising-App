import { useState, useCallback } from 'react';
import apiClient from '@/lib/axios';

/**
 * Custom hook for managing campaigns
 * Provides functions for fetching, creating, updating, and deleting campaigns
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data including asset_ids
   */
  const createCampaign = useCallback(async (campaignData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/campaigns', campaignData);
      const newCampaign = response.data;
      setCampaigns((prev) => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all campaigns for the current user
   */
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/campaigns');
      setCampaigns(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch campaigns';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a specific campaign by ID
   * @param {string} campaignId - The ID of the campaign
   */
  const fetchCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}`);
      const campaignData = response.data;
      setCampaign(campaignData);
      return campaignData;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a campaign
   * @param {string} campaignId - The ID of the campaign to update
   * @param {Object} campaignData - Campaign update data
   */
  const updateCampaign = useCallback(async (campaignId, campaignData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/campaigns/${campaignId}`, campaignData);
      const updatedCampaign = response.data;
      
      // Update in campaigns list
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? updatedCampaign : c))
      );
      
      // Update current campaign if it's the one being updated
      if (campaign && campaign.id === campaignId) {
        setCampaign(updatedCampaign);
      }
      
      return updatedCampaign;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  /**
   * Delete a campaign
   * @param {string} campaignId - The ID of the campaign to delete
   */
  const deleteCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/campaigns/${campaignId}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      
      // Clear current campaign if it's the one being deleted
      if (campaign && campaign.id === campaignId) {
        setCampaign(null);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  return {
    campaigns,
    campaign,
    loading,
    error,
    createCampaign,
    fetchCampaigns,
    fetchCampaign,
    updateCampaign,
    deleteCampaign,
  };
}


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
  const [generatingProof, setGeneratingProof] = useState(false);
  const [proofError, setProofError] = useState(null);

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

  /**
   * Generate email proof (MJML and HTML) for a campaign
   * @param {string} campaignId - The ID of the campaign
   * @returns {Promise<{mjml: string, html: string, generation_time: number}>}
   */
  const generateProof = useCallback(async (campaignId) => {
    setGeneratingProof(true);
    setProofError(null);
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/generate-proof`);
      const proofData = response.data;
      
      // Update campaign with generated content
      if (campaign && campaign.id === campaignId) {
        setCampaign((prev) => ({
          ...prev,
          generated_email_mjml: proofData.mjml,
          generated_email_html: proofData.html,
        }));
      }
      
      // Update in campaigns list
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId
            ? {
                ...c,
                generated_email_mjml: proofData.mjml,
                generated_email_html: proofData.html,
              }
            : c
        )
      );
      
      return proofData;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate email proof';
      setProofError(errorMessage);
      throw err;
    } finally {
      setGeneratingProof(false);
    }
  }, [campaign]);

  /**
   * Submit a campaign for approval
   * @param {string} campaignId - The ID of the campaign to submit
   */
  const submitCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/submit`);
      const updatedCampaign = await fetchCampaign(campaignId);
      
      // Update in campaigns list
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? updatedCampaign : c))
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to submit campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCampaign]);

  /**
   * Fetch approval queue (campaign manager only)
   */
  const fetchApprovalQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/campaigns/approval-queue');
      setCampaigns(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch approval queue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approve a campaign (campaign manager only)
   * @param {string} campaignId - The ID of the campaign to approve
   */
  const approveCampaign = useCallback(async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/approve`);
      const updatedCampaign = await fetchCampaign(campaignId);
      
      // Update in campaigns list
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? updatedCampaign : c))
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to approve campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCampaign]);

  /**
   * Reject a campaign with a reason (campaign manager only)
   * @param {string} campaignId - The ID of the campaign to reject
   * @param {string} rejectionReason - The reason for rejection
   */
  const rejectCampaign = useCallback(async (campaignId, rejectionReason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/reject`, {
        rejection_reason: rejectionReason,
      });
      const updatedCampaign = await fetchCampaign(campaignId);
      
      // Update in campaigns list
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? updatedCampaign : c))
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to reject campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCampaign]);

  return {
    campaigns,
    campaign,
    loading,
    error,
    generatingProof,
    proofError,
    createCampaign,
    fetchCampaigns,
    fetchCampaign,
    updateCampaign,
    deleteCampaign,
    generateProof,
    submitCampaign,
    fetchApprovalQueue,
    approveCampaign,
    rejectCampaign,
  };
}


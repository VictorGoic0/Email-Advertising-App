import { useState, useCallback } from 'react';
import apiClient from '@/lib/axios';

/**
 * Custom hook for managing performance metrics
 * Provides functions for fetching uptime, proof generation, queue depth, and approval rate metrics
 */
export function useMetrics() {
  const [uptimeMetrics, setUptimeMetrics] = useState({});
  const [proofGenerationMetrics, setProofGenerationMetrics] = useState(null);
  const [queueDepth, setQueueDepth] = useState(null);
  const [approvalRateMetrics, setApprovalRateMetrics] = useState(null);
  const [loading, setLoading] = useState({
    uptime: false,
    proofGeneration: false,
    queueDepth: false,
    approvalRate: false,
  });
  const [error, setError] = useState({
    uptime: null,
    proofGeneration: null,
    queueDepth: null,
    approvalRate: null,
  });

  /**
   * Fetch uptime metrics for all components (api, s3, database, openai)
   * @returns {Promise<Object>} Object with component names as keys and metrics as values
   */
  const fetchUptimeMetrics = useCallback(async () => {
    setLoading((prev) => ({ ...prev, uptime: true }));
    setError((prev) => ({ ...prev, uptime: null }));
    
    try {
      const components = ['api', 's3', 'database', 'openai'];
      const metrics = {};
      
      // Fetch all components in parallel
      const promises = components.map(async (component) => {
        try {
          const response = await apiClient.get(`/metrics/uptime?component=${component}`);
          return { component, data: response.data };
        } catch (err) {
          console.error(`Error fetching uptime for ${component}:`, err);
          return { component, data: null, error: err.message };
        }
      });
      
      const results = await Promise.all(promises);
      
      results.forEach(({ component, data, error: err }) => {
        if (err) {
          metrics[component] = { error: err };
        } else {
          metrics[component] = data;
        }
      });
      
      setUptimeMetrics(metrics);
      return metrics;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch uptime metrics';
      setError((prev) => ({ ...prev, uptime: errorMessage }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, uptime: false }));
    }
  }, []);

  /**
   * Fetch proof generation performance metrics
   * @returns {Promise<Object>} Proof generation metrics (average, p50, p95, p99, total_generations)
   */
  const fetchProofGenerationMetrics = useCallback(async () => {
    setLoading((prev) => ({ ...prev, proofGeneration: true }));
    setError((prev) => ({ ...prev, proofGeneration: null }));
    
    try {
      const response = await apiClient.get('/metrics/proof-generation');
      setProofGenerationMetrics(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch proof generation metrics';
      setError((prev) => ({ ...prev, proofGeneration: errorMessage }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, proofGeneration: false }));
    }
  }, []);

  /**
   * Fetch current approval queue depth
   * @returns {Promise<number>} Current queue depth
   */
  const fetchQueueDepth = useCallback(async () => {
    setLoading((prev) => ({ ...prev, queueDepth: true }));
    setError((prev) => ({ ...prev, queueDepth: null }));
    
    try {
      const response = await apiClient.get('/metrics/queue-depth');
      setQueueDepth(response.data.queue_depth);
      return response.data.queue_depth;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch queue depth';
      setError((prev) => ({ ...prev, queueDepth: errorMessage }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, queueDepth: false }));
    }
  }, []);

  /**
   * Fetch approval rate metrics
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Promise<Object>} Approval rate metrics
   */
  const fetchApprovalRate = useCallback(async (days = 7) => {
    setLoading((prev) => ({ ...prev, approvalRate: true }));
    setError((prev) => ({ ...prev, approvalRate: null }));
    
    try {
      const response = await apiClient.get(`/metrics/approval-rate?days=${days}`);
      setApprovalRateMetrics(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch approval rate';
      setError((prev) => ({ ...prev, approvalRate: errorMessage }));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, approvalRate: false }));
    }
  }, []);

  /**
   * Fetch all metrics at once
   * @param {number} approvalRateDays - Number of days for approval rate (default: 7)
   */
  const fetchAllMetrics = useCallback(async (approvalRateDays = 7) => {
    await Promise.all([
      fetchUptimeMetrics(),
      fetchProofGenerationMetrics(),
      fetchQueueDepth(),
      fetchApprovalRate(approvalRateDays),
    ]);
  }, [fetchUptimeMetrics, fetchProofGenerationMetrics, fetchQueueDepth, fetchApprovalRate]);

  return {
    uptimeMetrics,
    proofGenerationMetrics,
    queueDepth,
    approvalRateMetrics,
    loading,
    error,
    fetchUptimeMetrics,
    fetchProofGenerationMetrics,
    fetchQueueDepth,
    fetchApprovalRate,
    fetchAllMetrics,
  };
}


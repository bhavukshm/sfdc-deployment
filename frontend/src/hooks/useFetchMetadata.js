/**
 * Custom hook for fetching metadata
 */

import { useState, useCallback } from 'react';
import { metadataService } from '../services/metadataService';
import { useSalesforce } from '../context/SalesforceContext';

export function useFetchMetadata() {
  const { getAuthHeaders } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchMetadata = useCallback(async (type, folder = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await metadataService.listMetadata(type, folder, getAuthHeaders());
      setData(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch metadata');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  return { data, loading, error, fetchMetadata };
}

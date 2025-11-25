/**
 * Custom hook for deployments
 */

import { useState, useCallback } from 'react';
import { deployService } from '../services/deployService';
import { useSalesforce } from '../context/SalesforceContext';

export function useDeploy() {
  const { getAuthHeaders } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const deploy = useCallback(async (deploymentPackage, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const deployResult = await deployService.deploy(
        deploymentPackage,
        options,
        getAuthHeaders()
      );
      setResult(deployResult);
      return deployResult;
    } catch (err) {
      setError(err.response?.data?.message || 'Deployment failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const validate = useCallback(async (deploymentPackage) => {
    setLoading(true);
    setError(null);
    
    try {
      const validationResult = await deployService.validateDeployment(
        deploymentPackage,
        getAuthHeaders()
      );
      setResult(validationResult);
      return validationResult;
    } catch (err) {
      setError(err.response?.data?.message || 'Validation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  return { loading, error, result, deploy, validate };
}

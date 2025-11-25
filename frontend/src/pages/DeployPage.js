import React, { useState } from 'react';
import { useSalesforce } from '../context/SalesforceContext';
import { deployService } from '../services/deployService';
import './CommonPage.css';

function DeployPage() {
  const { getAuthHeaders } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [validateOnly, setValidateOnly] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const deploymentPackage = {
        types: [],
        apiVersion: '59.0',
        files: []
      };

      const options = {
        checkOnly: validateOnly,
        rollbackOnError: true
      };

      const result = validateOnly 
        ? await deployService.validateDeployment(deploymentPackage, getAuthHeaders())
        : await deployService.deploy(deploymentPackage, options, getAuthHeaders());
      
      setDeployResult(result);
    } catch (error) {
      console.error('Deploy failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Deploy Metadata</h2>
      
      <div className="card">
        <h3>Deployment Settings</h3>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={validateOnly}
            onChange={(e) => setValidateOnly(e.target.checked)}
          />
          Validation Only (Check Only)
        </label>

        <div className="deploy-options">
          <p>Select components to deploy...</p>
        </div>

        <button onClick={handleDeploy} disabled={loading}>
          {loading ? 'Processing...' : (validateOnly ? 'Validate' : 'Deploy')}
        </button>

        {deployResult && (
          <div className={deployResult.success ? 'success' : 'error'}>
            <h4>Deployment {deployResult.success ? 'Successful' : 'Failed'}</h4>
            <p>Status: {deployResult.status}</p>
            {deployResult.deployId && <p>Deploy ID: {deployResult.deployId}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeployPage;

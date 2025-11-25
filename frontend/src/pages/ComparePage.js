import React, { useState } from 'react';
import { useSalesforce } from '../context/SalesforceContext';
import { compareService } from '../services/compareService';
import './CommonPage.css';

function ComparePage() {
  const { getAuthHeaders } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  const handleCompare = async () => {
    setLoading(true);
    try {
      // Example: Compare metadata between source and target
      const result = await compareService.compareMetadata(
        {}, // source metadata
        {}, // target metadata
        getAuthHeaders()
      );
      setComparison(result);
    } catch (error) {
      console.error('Compare failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Org Comparison</h2>
      
      <div className="card">
        <h3>Compare Orgs</h3>
        <p className="description">
          Select source and target orgs to compare metadata components.
        </p>
        
        <div className="org-selector">
          <select>
            <option>Select Source Org</option>
          </select>
          <span>→</span>
          <select>
            <option>Select Target Org</option>
          </select>
        </div>

        <button onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Start Comparison'}
        </button>

        {comparison && (
          <div className="comparison-result">
            <h4>Results:</h4>
            <p>Only in source: {comparison.onlyInSource?.length || 0}</p>
            <p>Only in target: {comparison.onlyInTarget?.length || 0}</p>
            <p>Modified: {comparison.modified?.length || 0}</p>
            <p>Identical: {comparison.identical?.length || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComparePage;

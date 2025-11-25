import React, { useState } from 'react';
import { useSalesforce } from '../context/SalesforceContext';
import { metadataService } from '../services/metadataService';
import './CommonPage.css';

function MetadataPage() {
  const { getAuthHeaders } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  const handleDescribe = async () => {
    setLoading(true);
    try {
      const result = await metadataService.describeMetadata(getAuthHeaders());
      setMetadata(result);
    } catch (error) {
      console.error('Describe failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListMetadata = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      const result = await metadataService.listMetadata(selectedType, null, getAuthHeaders());
      console.log('Metadata list:', result);
    } catch (error) {
      console.error('List metadata failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Metadata Management</h2>
      
      <div className="card">
        <h3>Describe Metadata</h3>
        <button onClick={handleDescribe} disabled={loading}>
          {loading ? 'Loading...' : 'Describe Org Metadata'}
        </button>
        
        {metadata && (
          <div className="metadata-result">
            <p>Available metadata types: {metadata.metadataObjects?.length || 0}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>List Metadata by Type</h3>
        <input
          type="text"
          placeholder="Enter metadata type (e.g., ApexClass)"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        />
        <button onClick={handleListMetadata} disabled={loading || !selectedType}>
          List Metadata
        </button>
      </div>
    </div>
  );
}

export default MetadataPage;

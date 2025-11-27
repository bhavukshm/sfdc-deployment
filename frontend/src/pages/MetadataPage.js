import React, { useEffect, useRef, useState } from 'react';
import { useSalesforce } from '../context/SalesforceContext';
import { metadataService } from '../services/metadataService';
import './CommonPage.css';

function MetadataPage() {
  const { getAuthHeaders } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const metadataRequested = useRef(false);

  const handleDescribe = async () => {
    setLoading(true);
    try {
      if (!metadataRequested.current) {
        metadataRequested.current = true;
        const result = await metadataService.describeMetadata(getAuthHeaders());
        setMetadata(result);
        metadataRequested.current = true;
      }
    } catch (error) {
      console.error('Describe failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDescribe();
  }, []);

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
      <div>
        <h2>Metadata Management</h2>
        <p>Available metadata types: {(metadata && (metadata.metadataObjects?.length || 0)) || <strong>Loading...</strong>}</p>
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

import React, { useEffect, useRef, useState } from 'react';
import { useSalesforce } from '../context/SalesforceContext';
import { metadataService } from '../services/metadataService';
import './CommonPage.css';

function MetadataPage() {
  const { getAuthHeaders } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [fetchedData, setFetchedData] = useState(null);
  const metadataRequested = useRef(false);

  const handleDescribe = async () => {
    setLoading(true);
    try {
      if (!metadataRequested.current) {
        metadataRequested.current = true;
        const result = await metadataService.describeMetadata(getAuthHeaders());
        setMetadata(result);
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
      setFetchedData(result);
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
        <div className="org-selector">
          <select
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">--Select Metadata Type--</option>
          </select>
        </div>
        <button onClick={handleListMetadata} disabled={loading || !selectedType}>
          List Metadata
        </button>
      </div>

      {fetchedData && <div className="card">
        {fetchedData.map(element => {
          return <p>{element.fullName}</p>
        })}
      </div>}
    </div>
  );
}

export default MetadataPage;

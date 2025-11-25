import React, { useState, useEffect } from 'react';
import { useSalesforce } from '../context/SalesforceContext';
import { backupService } from '../services/backupService';
import './CommonPage.css';

function BackupPage() {
  const { getAuthHeaders, session } = useSalesforce();
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const result = await backupService.listBackups(session?.orgId, getAuthHeaders());
      setBackups(result);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const metadataTypes = ['ApexClass', 'ApexTrigger', 'CustomObject'];
      await backupService.createBackup(metadataTypes, getAuthHeaders());
      await loadBackups();
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Backup Management</h2>
      
      <div className="card">
        <h3>Create Backup</h3>
        <p>Create a complete backup of your Salesforce metadata.</p>
        
        <button onClick={handleCreateBackup} disabled={loading}>
          {loading ? 'Creating Backup...' : 'Create New Backup'}
        </button>
      </div>

      <div className="card">
        <h3>Backup History</h3>
        {backups.length === 0 ? (
          <p>No backups found.</p>
        ) : (
          <ul className="backup-list">
            {backups.map((backup) => (
              <li key={backup.backupId}>
                <strong>{backup.backupId}</strong>
                <span>{new Date(backup.timestamp).toLocaleString()}</span>
                <span>{backup.componentCount} components</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default BackupPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { useSalesforce } from '../context/SalesforceContext';
import './Header.css';

function Header() {
  const { isAuthenticated, orgInfo, logout } = useSalesforce();

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">SF DevOps Platform</h1>
        
        {isAuthenticated && (
          <nav className="nav-menu">
            <Link to="/metadata">Metadata</Link>
            <Link to="/compare">Compare</Link>
            <Link to="/deploy">Deploy</Link>
            <Link to="/backup">Backup</Link>
          </nav>
        )}

        {isAuthenticated && orgInfo && (
          <div className="user-section">
            <span className="org-info">{orgInfo.username || orgInfo.orgId}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

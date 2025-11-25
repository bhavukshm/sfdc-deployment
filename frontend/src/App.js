import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SalesforceProvider } from './context/SalesforceContext';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import MetadataPage from './pages/MetadataPage';
import ComparePage from './pages/ComparePage';
import DeployPage from './pages/DeployPage';
import BackupPage from './pages/BackupPage';
import './App.css';

function App() {
  return (
    <SalesforceProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/metadata" element={<MetadataPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/deploy" element={<DeployPage />} />
              <Route path="/backup" element={<BackupPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SalesforceProvider>
  );
}

export default App;

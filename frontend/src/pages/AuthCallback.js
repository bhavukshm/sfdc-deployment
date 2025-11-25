import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSalesforce } from '../context/SalesforceContext';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authenticate } = useSalesforce();
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionToken = searchParams.get('sessionToken');
    const orgId = searchParams.get('orgId');

    if (sessionToken && orgId) {
      authenticate(sessionToken, orgId);
      navigate('/metadata');
    } else {
      setError('Invalid callback parameters');
    }
  }, [searchParams, authenticate, navigate]);

  return (
    <div className="loading">
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <p>Completing authentication...</p>
      )}
    </div>
  );
}

export default AuthCallback;

import React, { useState, useEffect } from 'react';
import axios from '../config/axios';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [loginTest, setLoginTest] = useState('Not tested');
  const [error, setError] = useState(null);

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      setApiStatus('Testing...');
      const response = await axios.get('/');
      setApiStatus(`✅ API Connected: ${response.data.message}`);
      console.log('API Test Response:', response.data);
    } catch (err) {
      setApiStatus(`❌ API Error: ${err.message}`);
      setError(err);
      console.error('API Test Error:', err);
    }
  };

  const testLogin = async () => {
    try {
      setLoginTest('Testing login...');
      const response = await axios.post('/auth/login', {
        username: 'test',
        password: 'test'
      });
      setLoginTest(`✅ Login endpoint working: ${response.status}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setLoginTest('✅ Login endpoint working (expected 401 for invalid credentials)');
      } else {
        setLoginTest(`❌ Login error: ${err.message}`);
      }
      console.error('Login Test Error:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">API Status:</h3>
          <p className="text-sm">{apiStatus}</p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Login Endpoint:</h3>
          <p className="text-sm mb-2">{loginTest}</p>
          <button
            onClick={testLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login
          </button>
        </div>

        <div>
          <h3 className="font-medium mb-2">Environment Info:</h3>
          <div className="text-sm space-y-1">
            <p>Mode: {import.meta.env.MODE}</p>
            <p>Base URL: {import.meta.env.VITE_REACT_APP_API_URL || 'Not set'}</p>
            <p>Current URL: {window.location.origin}</p>
          </div>
        </div>

        {error && (
          <div>
            <h3 className="font-medium mb-2 text-red-600">Error Details:</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        <button
          onClick={testApiConnection}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Retest API Connection
        </button>
      </div>
    </div>
  );
};

export default ApiTest;
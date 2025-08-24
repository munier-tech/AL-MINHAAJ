import React from 'react';

const HealthCheck = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Frontend Loaded Successfully!
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          AL-MINHAAJ Management System is running
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">System Status</h2>
          <p className="text-green-600">✅ Frontend: Running</p>
          <p className="text-blue-600">🔍 Backend: Check API endpoint</p>
          <p className="text-gray-600">📱 Environment: {import.meta.env.MODE}</p>
          <p className="text-gray-600">🌐 Base URL: {import.meta.env.VITE_REACT_APP_API_URL || 'Not set'}</p>
        </div>
        <div className="mt-4">
          <a 
            href="/api" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Test Backend API
          </a>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
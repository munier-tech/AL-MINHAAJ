import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const CertificateDebug = ({ certificateUrl, teacherName }) => {
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkCertificateUrl = async () => {
    if (!certificateUrl) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(certificateUrl, { method: 'HEAD' });
      setIsValid(response.ok);
    } catch (error) {
      console.error('Certificate URL check failed:', error);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!certificateUrl || certificateUrl === 'no certificate') {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Certificate Debug Info
      </h4>
      <div className="space-y-2 text-xs">
        <p className="text-gray-600 dark:text-gray-400">
          <strong>URL:</strong> {certificateUrl}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Teacher:</strong> {teacherName}
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={checkCertificateUrl}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check URL'}
          </button>
          {isValid === true && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Valid</span>
            </div>
          )}
          {isValid === false && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Invalid</span>
            </div>
          )}
        </div>
        <button
          onClick={() => window.open(certificateUrl, '_blank')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Open in new tab
        </button>
      </div>
    </div>
  );
};

export default CertificateDebug;
import React, { useState } from 'react';
import { X, Download, Eye, FileText, AlertCircle } from 'lucide-react';

const CertificateViewer = ({ certificateUrl, teacherName, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Shahaadada lama soo bandhigi karin. Fadlan hubi in URL-ka sax yahay ama ku dar tab cusub.');
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('PDF-ka lama soo bandhigi karin. Fadlan ku dar tab cusub si aad u aragto.');
  };

  const handleDownload = () => {
    if (certificateUrl) {
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = `certificate_${teacherName || 'teacher'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isPdfFile = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf') || url.includes('resource_type=raw');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Shahaadada Macallinka
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {teacherName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Download Certificate"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Khalad ayaa dhacay
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                {error}
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  URL: {certificateUrl}
                </p>
                <button
                  onClick={() => window.open(certificateUrl, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ku dar tab cusub
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              {isLoading && (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Soo bandhigida shahaadada...</p>
                </div>
              )}
              
              {certificateUrl && (
                <div className="w-full">
                  {isImageFile(certificateUrl) ? (
                    <img
                      src={certificateUrl}
                      alt={`Certificate for ${teacherName}`}
                      className={`max-w-full h-auto rounded-lg shadow-lg ${imageLoaded ? 'block' : 'hidden'}`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : isPdfFile(certificateUrl) ? (
                    <iframe
                      src={certificateUrl}
                      className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg"
                      onLoad={handleImageLoad}
                      onError={handleIframeError}
                      title={`Certificate for ${teacherName}`}
                    />
                                     ) : (
                     <div className="text-center">
                       <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                       <p className="text-gray-600 dark:text-gray-400 mb-4">
                         Fadlan ku dar tab cusub si aad u aragto shahaadada
                       </p>
                       <div className="space-y-3">
                         <button
                           onClick={() => window.open(certificateUrl, '_blank')}
                           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                         >
                           <Eye className="h-5 w-5 mr-2" />
                           Ku dar tab cusub
                         </button>
                         <button
                           onClick={handleDownload}
                           className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                         >
                           <Download className="h-5 w-5 mr-2" />
                           Soo deji
                         </button>
                       </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;
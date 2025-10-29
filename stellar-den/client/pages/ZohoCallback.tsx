import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ZohoCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`OAuth Error: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      return;
    }

    // Send the code to our backend
    fetch('/api/zoho/auth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage('Zoho integration successful! You can now use contact forms and email features.');
        } else {
          setStatus('error');
          setMessage(`Error: ${data.error}`);
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage(`Network error: ${err.message}`);
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mb-4">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="text-green-600 text-6xl">✓</div>
            )}
            {status === 'error' && (
              <div className="text-red-600 text-6xl">✗</div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Processing Authorization...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-3">
              <a 
                href="/contact" 
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Test Contact Form
              </a>
              <a 
                href="/" 
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </a>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/api/zoho/auth-url'}
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <a 
                href="/" 
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZohoCallback;

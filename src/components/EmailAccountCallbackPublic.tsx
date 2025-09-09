import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const EmailAccountCallbackPublic: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setError(`OAuth error: ${error}`);
          return;
        }
        
        if (!code) {
          setStatus('error');
          setError('No authorization code received from Google');
          return;
        }

        console.log('Processing OAuth callback for invited user...');
        
        // Call the public OAuth callback endpoint
        const response = await fetch(`${API_BASE_URL}/api/email-accounts/oauth/gmail/callback-public`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `code=${encodeURIComponent(code)}`,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to process OAuth callback');
        }

        const data = await response.json();
        console.log('OAuth callback successful:', data);
        
        setStatus('success');
        setMessage(data.message || 'Email account connected successfully!');
        
        // Clear the pending invite token
        sessionStorage.removeItem('pending_email_invite_token');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        
      } catch (err: any) {
        console.error('Error processing OAuth callback:', err);
        setStatus('error');
        setError(err.message || 'Failed to process OAuth callback');
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connecting Your Email Account</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Please wait while we complete the OAuth process and connect your email account to the system.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Failed</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Account Connected!</h1>
          <p className="text-green-600 mb-6">{message}</p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-800">
              <Mail className="h-5 w-5 mr-2" />
              <span className="text-sm">
                Your email account has been successfully connected and is now part of the invoice scanning system.
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Go to Dashboard
            </button>
            <p className="text-sm text-gray-500">
              You will be automatically redirected in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EmailAccountCallbackPublic; 
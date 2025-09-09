import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const EmailAccountCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your email account...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple executions (React StrictMode runs effects twice)
      if (hasProcessed) return;
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      // Only set hasProcessed if we have a code to process
      if (code) {
        setHasProcessed(true);
      }
      const state = searchParams.get('state');

      console.log('Email account callback params:', { code: code?.substring(0, 20), error, state });

      if (error) {
        console.error('OAuth error:', error);
        setStatus('error');
        setMessage(`OAuth error: ${error}`);
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        setStatus('error');
        setMessage('No authorization code received from Google');
        return;
      }

      try {
        // Get the access token from localStorage
        const token = localStorage.getItem('access_token');
        if (!token) {
          setStatus('error');
          setMessage('User not authenticated. Please log in first.');
          return;
        }

        console.log('Exchanging code for email account tokens...');
        
        // Exchange code for email account tokens using query parameters
        const response = await fetch(`${API_BASE_URL}/api/email-accounts/oauth/gmail/callback?code=${encodeURIComponent(code)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Email account callback failed:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            setStatus('error');
            setMessage(errorData.detail || `HTTP error! status: ${response.status}`);
          } catch {
            setStatus('error');
            setMessage(`HTTP error! status: ${response.status} - ${errorText}`);
          }
          return;
        }

        const data = await response.json();
        console.log('Email account connected successfully:', data);
        
        // Check if this was from an invitation
        const pendingInviteToken = sessionStorage.getItem('pending_email_invite_token');
        
        if (pendingInviteToken) {
          // Clear the invite token
          sessionStorage.removeItem('pending_email_invite_token');
          
          setStatus('success');
          setMessage('Email account connected successfully! You can now scan for invoices from this account.');
          
          // Redirect to dashboard after a longer delay for invited users
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('success');
          setMessage('Email account connected successfully!');
          
          // Redirect to email accounts page after a short delay
          setTimeout(() => {
            navigate('/email-accounts');
          }, 2000);
        }

      } catch (error) {
        console.error('Email account callback error:', error);
        setStatus('error');
        setMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    handleCallback();
  }, [searchParams, navigate, hasProcessed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {status === 'loading' && (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            
            <div className="mb-4">
              <Mail className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Account Setup
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              {message}
            </p>
            
            {status === 'loading' && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-500">
                  Connecting to Gmail...
                </p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-3">
                <div className="text-green-600 font-medium">
                  ✓ Connection established
                </div>
                <p className="text-sm text-gray-500">
                  {sessionStorage.getItem('pending_email_invite_token') 
                    ? 'Redirecting to dashboard...' 
                    : 'Redirecting to email accounts...'
                  }
                </p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/email-accounts')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Email Accounts
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAccountCallback; 
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const hasProcessed = useRef(false); // Prevent double execution in React StrictMode

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution in React StrictMode
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      // Get the authorization code from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');

      if (error) {
        console.error('Google OAuth error:', error);
        alert('Google authentication failed');
        navigate('/');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        alert('No authorization code received');
        navigate('/');
        return;
      }

      console.log('Processing OAuth code:', code.substring(0, 20) + '...');
      console.log('OAuth state:', state);

      try {
        // Check if this is email account OAuth or main authentication
        if (state === 'email_account_oauth') {
          // Handle email account OAuth (authenticated users)
          const token = localStorage.getItem('access_token');
          if (!token) {
            throw new Error('User not authenticated. Please log in first.');
          }

          // Exchange code for email account tokens
          const response = await fetch(`${API_BASE_URL}/api/email-accounts/oauth/gmail/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Email account callback failed:', errorText);
            
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            } catch {
              throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
          }

          const data = await response.json();
          
          console.log('Email account connected successfully:', data);
          alert('Email account connected successfully!');
          
          // Clean up URL and redirect to email accounts page
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/email-accounts');
          
        } else if (state === 'email_account_oauth_public') {
          // Handle public email account OAuth (invited users)
          console.log('Processing public email account OAuth...');
          
          // Exchange code for email account tokens using public endpoint
          const response = await fetch(`${API_BASE_URL}/api/email-accounts/oauth/gmail/callback-public?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Public email account callback failed:', errorText);
            
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            } catch {
              throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
          }

          const data = await response.json();
          
          console.log('Public email account connected successfully:', data);
          alert('Email account connected successfully! You can now close this window.');
          
          // Clean up URL and redirect to success page or close window
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // For invited users, show success message and option to close
          navigate('/invite-success', { 
            state: { 
              message: 'Email account connected successfully!',
              email: data.email,
              inviter_user_id: data.inviter_user_id
            }
          });
          
        } else {
          // Handle main authentication OAuth
          // Exchange code for JWT token using the correct endpoint
          const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Exchange failed:', errorText);
            
            // Try to parse as JSON for better error message
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            } catch {
              throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
          }

          const data = await response.json();
          
          // Use AuthContext to set user data
          setUserData(data.user, data.access_token);

          console.log('Authentication successful:', data.user);
          
          // Clean up URL and redirect to dashboard
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/dashboard');
        }
        
              } catch (error) {
        console.error('Authentication failed:', error);
        alert(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setUserData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sky-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white shadow-lg">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {new URLSearchParams(window.location.search).get('state') === 'email_account_oauth' 
                  ? 'Connecting Email Account' 
                  : 'Almost there!'}
              </h2>
              <p className="text-gray-600">
                {new URLSearchParams(window.location.search).get('state') === 'email_account_oauth'
                  ? "We're securely connecting your email account..."
                  : "We're securely connecting your Google account..."}
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
              <span className="text-sm text-gray-600">
                {new URLSearchParams(window.location.search).get('state') === 'email_account_oauth'
                  ? 'Processing email connection'
                  : 'Completing sign-in'}
              </span>
            </div>

            <div className="text-xs text-gray-500 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Authorization received</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse h-4 w-4 rounded-full bg-blue-500"></div>
                <span>
                  {new URLSearchParams(window.location.search).get('state') === 'email_account_oauth'
                    ? 'Connecting to your email...'
                    : 'Verifying your identity...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback; 
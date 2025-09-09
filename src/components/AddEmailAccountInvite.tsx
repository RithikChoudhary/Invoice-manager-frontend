import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inviteAPI } from '../services/inviteService';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Clock, UserPlus, Mail } from 'lucide-react';

const AddEmailAccountInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'accepting' | 'success' | 'error'>('loading');
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      validateInvite();
    }
  }, [token]);

  const validateInvite = async () => {
    try {
      const response = await inviteAPI.validateToken(token!);
      if (response.valid && response.invite_type === 'add_email_account') {
        setInviteData(response);
        setStatus('valid');
      } else if (response.valid && response.invite_type !== 'add_email_account') {
        setStatus('invalid');
        setError('This is not an email account addition invite link');
      } else {
        setStatus(response.reason === 'expired' ? 'expired' : 'invalid');
        setError(response.message || 'Invalid invite link');
      }
    } catch (err: any) {
      console.error('Error validating invite:', err);
      setStatus('invalid');
      setError(err.response?.data?.detail || 'Invalid invite link');
    }
  };

  const acceptInvite = async () => {
    if (!isAuthenticated) {
      // Redirect to login first
      login();
      return;
    }

    setStatus('accepting');
    try {
      const response = await inviteAPI.acceptInvite({ invite_token: token! });
      if (response.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(response.message || 'Failed to accept invite');
      }
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      setStatus('error');
      setError(err.response?.data?.detail || 'Failed to accept invite');
    }
  };

  const connectEmailAccount = () => {
    // Redirect to OAuth flow for adding email account
    window.location.href = '/api/email-accounts/oauth/gmail/authorize';
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Validating invite link...</p>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invite Link</h2>
            <p className="text-gray-600 mb-6">{error || 'This invite link is not valid or has been used already.'}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invite Link Expired</h2>
            <p className="text-gray-600 mb-6">This invite link has expired. Please request a new one from the person who invited you.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        );

      case 'valid':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Account Invite</h2>
            <p className="text-gray-600 mb-4">
              You've been invited to add your email account to invoice processing system.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900">Invited Email</h4>
                  <p className="text-sm text-blue-700 mt-1">{inviteData?.invited_email}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Make sure you're logged in with this email address to accept the invite.
                  </p>
                </div>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">You need to log in first to accept this invite.</p>
                <button
                  onClick={acceptInvite}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Log In to Accept Invite
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Click below to accept this invite and start the email account connection process.
                </p>
                <button
                  onClick={acceptInvite}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Accept Invite
                </button>
              </div>
            )}
          </div>
        );

      case 'accepting':
        return (
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Accepting invite...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invite Accepted!</h2>
            <p className="text-gray-600 mb-6">
              Great! Now you need to connect your email account to complete the setup.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-left">
                <h4 className="text-sm font-medium text-green-900">Next Steps</h4>
                <ol className="text-sm text-green-700 mt-2 space-y-1">
                  <li>1. Click "Connect Email Account" below</li>
                  <li>2. Sign in with your Gmail account ({inviteData?.invited_email})</li>
                  <li>3. Grant permission to access your emails</li>
                  <li>4. Your invoices will be automatically processed!</li>
                </ol>
              </div>
            </div>

            <button
              onClick={connectEmailAccount}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Connect Email Account
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => setStatus('valid')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-3"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AddEmailAccountInvite; 
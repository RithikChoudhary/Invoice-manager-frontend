import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inviteAPI } from '../services/inviteService';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Clock, UserPlus } from 'lucide-react';

const InviteAccept: React.FC = () => {
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
      if (response.valid) {
        setInviteData(response.invite);
        setStatus('valid');
      } else {
        setStatus(response.reason === 'expired' ? 'expired' : 'invalid');
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
        // Redirect to email accounts page after 3 seconds
        setTimeout(() => {
          navigate('/email-accounts');
        }, 3000);
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

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Invite</h2>
            <p className="text-gray-600">Please wait while we validate your invite link...</p>
          </div>
        );

      case 'valid':
        return (
          <div className="text-center">
            <UserPlus className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h2>
            <p className="text-gray-600 mb-6">
              You've been invited to access an email account for invoice scanning.
            </p>
            {inviteData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Email Account:</strong> {inviteData.email || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Expires:</strong> {new Date(inviteData.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
            <button
              onClick={acceptInvite}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {isAuthenticated ? 'Accept Invite' : 'Login & Accept Invite'}
            </button>
          </div>
        );

      case 'accepting':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Accepting Invite</h2>
            <p className="text-gray-600">Processing your invite...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-4">
              You've successfully accepted the invite. You now have access to the email account.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the email accounts page...
            </p>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <Clock className="h-16 w-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Expired</h2>
            <p className="text-gray-600 mb-6">
              This invite link has expired. Please request a new invite from the person who shared this with you.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        );

      case 'invalid':
      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h2>
            <p className="text-gray-600 mb-4">
              {error || 'This invite link is invalid or has already been used.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default InviteAccept; 
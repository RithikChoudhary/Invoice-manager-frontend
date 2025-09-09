import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  UserPlus, 
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Shield,
  // Zap
} from 'lucide-react';
import { inviteAPI } from '../services/inviteService';
import { emailAccountsAPI } from '../services/api';

const EmailAccountInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Validate invite token
  const { data: inviteData, isLoading: isValidating, error: validationError } = useQuery({
    queryKey: ['invite-validation', token],
    queryFn: () => inviteAPI.validateToken(token!),
    enabled: !!token,
    retry: false
  });

  // Accept invite mutation (public - no authentication required)
  const acceptInviteMutation = useMutation({
    mutationFn: (token: string) => inviteAPI.acceptInvitePublic({ invite_token: token }),
    onSuccess: (data) => {
      console.log('Invite accepted successfully:', data);
      // After accepting invite, redirect to login
      setShowLoginPrompt(true);
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to accept invite');
    }
  });

  // Handle invite acceptance
  const handleAcceptInvite = async () => {
    if (!token) return;
    
    try {
      await acceptInviteMutation.mutateAsync(token);
      // After accepting, proceed to connect email account
      handleConnectEmailAccount();
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  // Handle email account connection
  const handleConnectEmailAccount = async () => {
    if (!token) return;
    
    setIsConnecting(true);
    try {
      // For invited users, we need to use a special OAuth flow
      // that doesn't require authentication
      // Use the configured API service with proper base URL
      console.log('🔗 Requesting public OAuth URL for Gmail...');
      const data = await emailAccountsAPI.getOAuthUrlPublic('gmail');
      
      console.log('✅ OAuth URL response received successfully');
      console.log('📧 OAuth URL data:', data);
      
      if (data?.auth_url) {
        // Store the invite token in session storage for the OAuth callback
        sessionStorage.setItem('pending_email_invite_token', token);
        console.log('🔗 Redirecting to OAuth URL:', data.auth_url);
        window.location.href = data.auth_url;
      } else {
        throw new Error('OAuth URL not found in response');
      }
    } catch (error) {
      console.error('❌ Error starting OAuth flow:', error);
      setError('Failed to start email account connection process');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle different states
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (validationError || !inviteData?.valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            {inviteData?.message || 'This invitation link is invalid or has expired.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const invite = inviteData;
  const isExpired = new Date(invite.expires_at) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please contact the person who invited you for a new invitation.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Email Account Invitation</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You've been invited to connect your email account for automatic invoice scanning and processing.
          </p>
        </div>

        {/* Invitation Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Invitation Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    <strong>Type:</strong> Email Account Connection
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    <strong>For Email:</strong> {invite.invited_email}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    <strong>Expires:</strong> {new Date(invite.expires_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What You'll Get</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700">Automatic invoice scanning from your emails</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700">Secure Google Drive integration</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700">Organized invoice management</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <span className="text-gray-700">Access from anywhere</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Security & Privacy</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Your email credentials are never stored</li>
                <li>• Only invoice-related emails are processed</li>
                <li>• All data is encrypted and secure</li>
                <li>• You can disconnect your account at any time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {showLoginPrompt ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-900">Invitation Accepted!</h3>
              </div>
              <p className="text-green-800 mb-4">
                Your invitation has been accepted successfully. Now you need to log in with Google to connect your email account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Log In with Google
                </button>
                <button
                  onClick={() => window.open('/login', '_blank')}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5 mr-2" />
                  Open in New Tab
                </button>
              </div>
              <p className="text-sm text-green-700 mt-3">
                After logging in, you'll be able to connect your email account and start processing invoices.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleAcceptInvite}
                  disabled={isConnecting || acceptInviteMutation.isPending}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {acceptInviteMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Accepting Invitation...
                    </>
                  ) : (
                    <>
                      Accept Invitation
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-500">
                By accepting this invitation, you agree to connect your email account for invoice processing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailAccountInvite; 
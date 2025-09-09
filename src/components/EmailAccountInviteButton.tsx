import React, { useState } from 'react';
import { UserPlus, Copy, Check, Mail, Clock, AlertCircle } from 'lucide-react';
import { inviteAPI } from '../services/inviteService';
import type { CreateEmailAccountInviteRequest } from '../services/inviteService';

const EmailAccountInviteButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    invited_email: '',
    expires_in_hours: 24
  });

  const createEmailAccountInvite = async () => {
    if (!formData.invited_email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
              const request: CreateEmailAccountInviteRequest = {
        invited_email: formData.invited_email,
        expires_in_hours: formData.expires_in_hours
      };
      
      const response = await inviteAPI.createEmailAccountInvite(request);
      setInviteUrl(response.invite_url);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create invite link');
      console.error('Error creating email account invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setInviteUrl('');
    setError(null);
    setCopied(false);
    setFormData({ invited_email: '', expires_in_hours: 24 });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Invite User to Add Email
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Invite User to Add Email Account
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!inviteUrl ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">How this works</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        The invited user will be able to connect their email account to your system. 
                        Their invoices will be processed and available in your dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="invited_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address to Invite
                  </label>
                  <input
                    type="email"
                    id="invited_email"
                    value={formData.invited_email}
                    onChange={(e) => setFormData({ ...formData, invited_email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.invited_email && !validateEmail(formData.invited_email) && (
                    <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expires_in_hours" className="block text-sm font-medium text-gray-700 mb-2">
                    Expires In
                  </label>
                  <select
                    id="expires_in_hours"
                    value={formData.expires_in_hours}
                    onChange={(e) => setFormData({ ...formData, expires_in_hours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={24}>24 Hours</option>
                    <option value={72}>3 Days</option>
                    <option value={168}>1 Week</option>
                  </select>
                </div>

                {error && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createEmailAccountInvite}
                    disabled={loading || !formData.invited_email || !validateEmail(formData.invited_email)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Invite Link'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Invite Link Created!</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Send this link to <strong>{formData.invited_email}</strong> to invite them to add their email account.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm text-gray-600 font-mono break-all">{inviteUrl}</p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h5 className="text-sm font-medium text-yellow-800">Important</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        This link will expire in {formData.expires_in_hours} hour{formData.expires_in_hours !== 1 ? 's' : ''}. 
                        The invited user must use it before then to connect their email account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmailAccountInviteButton; 
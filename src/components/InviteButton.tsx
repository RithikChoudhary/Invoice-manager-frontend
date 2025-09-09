import React, { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { inviteAPI } from '../services/inviteService';
import type { CreateInviteRequest } from '../services/inviteService';

interface InviteButtonProps {
  emailAccountId: string;
  emailAddress: string;
}

const InviteButton: React.FC<InviteButtonProps> = ({ emailAccountId, emailAddress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: CreateInviteRequest = {
        email_account_id: emailAccountId,
        expires_in_hours: 24 // 24 hours
      };
      
      const response = await inviteAPI.createInvite(request);
      setInviteUrl(response.invite_url);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create invite link');
      console.error('Error creating invite:', error);
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
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Share2 className="h-4 w-4" />
        Invite Others
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite Others</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Create an invite link for <span className="font-medium">{emailAddress}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Others can use this link to add their email accounts and scan for invoices.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!inviteUrl ? (
                <button
                  onClick={createInvite}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Create Invite Link
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-500 mb-1">Invite Link (24 hours)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inviteUrl}
                        readOnly
                        className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>• Share this link with others</p>
                    <p>• They can add their email accounts</p>
                    <p>• Link expires in 24 hours</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InviteButton; 
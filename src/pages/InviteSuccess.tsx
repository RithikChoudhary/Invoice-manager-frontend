import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, User, ArrowRight } from 'lucide-react';

const InviteSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message, email, inviter_user_id } = location.state || {};

  const handleClose = () => {
    window.close();
    // If window.close() doesn't work, redirect to home
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-green-200">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Account Connected!
              </h2>
              <p className="text-gray-600">
                {message || 'Your email account has been successfully connected to the system.'}
              </p>
            </div>

            {/* Details */}
            {email && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Connected Email: {email}
                  </span>
                </div>
                
                {inviter_user_id && (
                  <div className="flex items-center justify-center space-x-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Linked to inviter's account
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* What Happens Next */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-xs text-blue-800 space-y-1 text-left">
                <li>• Your email account is now connected to the inviter's system</li>
                <li>• The inviter can scan invoices from your email</li>
                <li>• You can close this window</li>
                <li>• No further action is required from you</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Close Window</span>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Go to Home</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500">
              <p>
                Your email account is now part of the invoice scanning system. 
                The person who invited you will be able to process invoices from your emails.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteSuccess; 
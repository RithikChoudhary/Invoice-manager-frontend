import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface SyncProgressProps {
  isSyncing: boolean;
  progress?: {
    total_emails: number;
    processed_count: number;
    current_email?: string;
    errors: string[];
  };
  onClose?: () => void;
}

const SyncProgress: React.FC<SyncProgressProps> = ({ isSyncing, progress }) => {
  if (!isSyncing) return null;

  const percentage = progress ? Math.round((progress.processed_count / progress.total_emails) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Syncing Email Account</h3>
          <p className="text-gray-600 mb-6">Processing invoices from your emails...</p>
          
          {progress && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              {/* Progress Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{progress.processed_count}</div>
                  <div className="text-gray-500">Processed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-600">{progress.total_emails}</div>
                  <div className="text-gray-500">Total Emails</div>
                </div>
              </div>
              
              {/* Current Email */}
              {progress.current_email && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">Processing:</div>
                  <div className="truncate">{progress.current_email}</div>
                </div>
              )}
              
              {/* Errors */}
              {progress.errors.length > 0 && (
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle size={16} />
                    <span className="font-medium">{progress.errors.length} errors</span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg max-h-20 overflow-y-auto">
                    {progress.errors.map((error, index) => (
                      <div key={index} className="text-red-600 text-xs">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 text-xs text-gray-500">
            This may take a few minutes depending on the number of emails
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncProgress; 
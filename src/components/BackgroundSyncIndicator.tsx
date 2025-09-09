import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';

interface SyncOperation {
  id: string;
  type: 'inbox' | 'groups';
  accountId: string;
  accountEmail: string;
  status: 'running' | 'completed' | 'error';
  startTime: Date;
  endTime?: Date;
  message?: string;
}

interface BackgroundSyncIndicatorProps {
  operations: SyncOperation[];
  onDismiss: (id: string) => void;
}

const BackgroundSyncIndicator: React.FC<BackgroundSyncIndicatorProps> = ({ 
  operations, 
  onDismiss 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const runningOperations = operations.filter(op => op.status === 'running');
  const completedOperations = operations.filter(op => op.status !== 'running');
  
  if (operations.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center space-x-2">
            {runningOperations.length > 0 ? (
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {runningOperations.length > 0 
                ? `Syncing ${runningOperations.length} account${runningOperations.length > 1 ? 's' : ''}...`
                : 'Sync completed'
              }
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (runningOperations.length === 0) {
                // Dismiss all completed operations
                completedOperations.forEach(op => onDismiss(op.id));
              }
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Detailed Operations */}
        {!collapsed && (
          <div className="border-t border-gray-100 max-h-64 overflow-y-auto">
            {operations.map((operation) => (
              <div key={operation.id} className="p-3 border-b border-gray-50 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    {operation.status === 'running' && (
                      <RefreshCw className="h-3 w-3 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    {operation.status === 'completed' && (
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    )}
                    {operation.status === 'error' && (
                      <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {operation.accountEmail}
                      </div>
                      <div className="text-xs text-gray-500">
                        {operation.type === 'inbox' ? 'Inbox sync' : 'Groups sync'}
                        {operation.status === 'running' && (
                          <span className="ml-1">
                            ({Math.round((Date.now() - operation.startTime.getTime()) / 1000)}s)
                          </span>
                        )}
                      </div>
                      {operation.message && (
                        <div className="text-xs text-gray-400 mt-1">
                          {operation.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {operation.status !== 'running' && (
                    <button
                      onClick={() => onDismiss(operation.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundSyncIndicator; 
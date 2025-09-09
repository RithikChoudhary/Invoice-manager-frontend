import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Users, Mail, RefreshCw } from 'lucide-react';
import { groupsAPI } from '../services/groupsService';
import type { GoogleGroup } from '../services/groupsService';

interface GroupSelectorProps {
  emailAccountId: string;
  selectedGroups: string[];
  onGroupsChange: (groupIds: string[]) => void;
  onScanGroups: (groupIds: string[]) => void;
  isScanning?: boolean;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  emailAccountId,
  selectedGroups,
  onGroupsChange,
  onScanGroups,
  isScanning = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<GoogleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`🏗️ GroupSelector mounted for account: ${emailAccountId}`);
    console.log(`📊 Initial selectedGroups:`, selectedGroups);
    fetchGroups();
    
    return () => {
      console.log(`🗑️ GroupSelector unmounting for account: ${emailAccountId}`);
    };
  }, [emailAccountId]);

  useEffect(() => {
    console.log(`🔄 GroupSelector selectedGroups updated for account ${emailAccountId}:`, selectedGroups);
  }, [selectedGroups, emailAccountId]);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const groupsData = await groupsAPI.getAll(emailAccountId);
      const validGroups = (groupsData || []).filter((group: GoogleGroup) => {
        if (!group.group_id) {
          console.warn(`⚠️ Group missing group_id, skipping:`, group);
          return false;
        }
        return true;
      });
      
      console.log(`📊 Fetched ${validGroups.length} valid groups for account ${emailAccountId}:`, validGroups.map((g: GoogleGroup) => ({ group_id: g.group_id, name: g.name })));
      setGroups(validGroups);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setError('Google Groups access requires additional permissions. Please reconnect your account with the required permissions.');
      } else {
        setError('Failed to fetch Google Groups.');
      }
      console.error('Error fetching Google Groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncGroups = async () => {
    setSyncing(true);
    setError(null);
    try {
      const result = await groupsAPI.syncGroups(emailAccountId);
      if (result.success) {
        await fetchGroups(); // Refresh the groups list
      } else {
        setError(result.message || 'Failed to sync groups.');
      }
    } catch (error: any) {
      setError('Error syncing Google Groups.');
    } finally {
      setSyncing(false);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    console.log(`🔄 Toggling group ${groupId} for account ${emailAccountId}`);
    console.log('📋 Current selected groups:', selectedGroups);
    console.log('📝 All available groups:', groups.map((g: GoogleGroup) => ({ group_id: g.group_id, name: g.name })));
    
    if (!groupId) {
      console.error('❌ Cannot toggle group with undefined/null ID');
      return;
    }
    
    const isCurrentlySelected = selectedGroups.includes(groupId);
    console.log(`📊 Group ${groupId} is currently selected:`, isCurrentlySelected);
    
    const newSelection = isCurrentlySelected
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    
    console.log('✅ New selection:', newSelection);
    console.log(`📈 Selection change: ${selectedGroups.length} -> ${newSelection.length}`);
    
    onGroupsChange(newSelection);
  };

  const handleScanSelected = () => {
    if (selectedGroups.length > 0) {
      onScanGroups(selectedGroups);
    }
  };

  const selectedGroupsData = groups.filter(group => selectedGroups.includes(group.group_id));
  // const connectedGroups = groups.filter(group => group.connected);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Google Groups Scanner
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select groups to scan for invoices and receipts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncGroups}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Groups'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              {selectedGroups.length > 0 ? `${selectedGroups.length} selected` : 'Select Groups'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Debug Info */}
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          Account ID: {emailAccountId} | Selected: {selectedGroups.length} | Groups: {groups.length}
        </div>

        {/* Selected Groups Display */}
        {selectedGroupsData.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Selected Groups ({selectedGroupsData.length})
            </h4>
            <div className="grid gap-2">
              {selectedGroupsData.map(group => (
                <div key={`selected-${group.group_id}`} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.email}</p>
                      {group.member_count > 0 && (
                        <p className="text-xs text-green-600">{group.member_count} members</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleGroupToggle(group.group_id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups Dropdown */}
        {isOpen && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="font-medium">Loading Google Groups...</p>
                <p className="text-sm">This may take a few moments</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                <Mail className="h-12 w-12 mx-auto mb-3 text-red-400" />
                <p className="font-medium mb-2">Failed to load groups</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium mb-2">No Google Groups found</p>
                <p className="text-sm">Click "Sync Groups" to fetch your Google Groups</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Available Groups ({groups.length})
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  {groups.map((group) => {
                    // Debug log to check group data
                    if (!group.group_id) {
                      console.warn('Group missing group_id:', group);
                    }
                    return (
                      <label
                        key={group.group_id || `group-${Math.random()}`}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedGroups.includes(group.group_id) 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.group_id)}
                          onChange={(e) => {
                            e.preventDefault();
                            console.log('Checkbox onChange for group:', group.group_id, group.name);
                            if (group.group_id) {
                              handleGroupToggle(group.group_id);
                            } else {
                              console.error('Cannot toggle group with undefined group_id:', group);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                        <p className="text-xs text-gray-500 truncate">{group.email}</p>
                        {group.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{group.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {group.connected && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                        {group.member_count > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {group.member_count}
                          </span>
                        )}
                      </div>
                    </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scan Button */}
        {selectedGroups.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Ready to Scan</h4>
                <p className="text-sm text-blue-700">
                  {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''} selected for invoice scanning
                </p>
              </div>
              <button
                onClick={handleScanSelected}
                disabled={isScanning}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors font-medium"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Scanning Groups...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Start Scanning
                  </>
                )}
              </button>
            </div>
            {isScanning && (
              <div className="mt-3 text-xs text-blue-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  Processing emails from selected groups...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSelector; 
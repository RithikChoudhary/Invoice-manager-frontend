import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, RefreshCw, Trash2,  CheckCircle, AlertCircle, Clock, Shield, Zap, Database } from 'lucide-react';
import { emailAccountsAPI } from '../services/api';

import EmailAccountInviteButton from './EmailAccountInviteButton';

const EmailAccounts: React.FC = () => {
  const [isLinking, setIsLinking] = useState(false);
  const [syncingInboxId, setSyncingInboxId] = useState<string | null>(null);
  const [scanDateRange, setScanDateRange] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  // Get date range for account (default to 3 months)
  const getDateRange = (accountId: string) => scanDateRange[accountId] || 3;
  
  // Set date range for account
  const setDateRangeForAccount = (accountId: string, months: number) => {
    setScanDateRange(prev => ({ ...prev, [accountId]: months }));
  };

  const { data: emailAccounts, isLoading } = useQuery({
    queryKey: ['email-accounts'],
    queryFn: () => emailAccountsAPI.getAll(),
  });

  // const syncMutation = useMutation({
  //   mutationFn: (accountId: string) => emailAccountsAPI.sync(accountId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
  //   },
  // });

  const deleteMutation = useMutation({
    mutationFn: (accountId: string) => emailAccountsAPI.delete(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });

  const handleLinkAccount = async (provider: string) => {
    setIsLinking(true);
    try {
      const response = await emailAccountsAPI.getOAuthUrl(provider);
      console.log("response for the email connect",response)
      if (response?.auth_url) {
        window.location.href = response.auth_url;
      }
    } catch (error) {
      console.error('Error linking account:', error);
      alert('Failed to start account linking process');
    } finally {
      setIsLinking(false);
    }
  };


  const handleSyncInbox = async (accountId: string) => {
    setSyncingInboxId(accountId);
    try {
      const months = getDateRange(accountId);
      const result = await emailAccountsAPI.syncInbox(accountId, months);

      console.log("sync result is:::",result)
      
      // Show success message with estimated time and date range
      const dateRange = months === 1 ? '1 month' : `${months} months`;
      if (result?.estimated_time) {
        alert(`✅ Inbox scan started successfully!\n\nScanning emails from the last ${dateRange}\nEstimated completion time: ${result.estimated_time}\n\nThe scan is running in the background. You can continue using the app.`);
      } else {
        alert(`✅ Inbox scan started successfully!\n\nScanning emails from the last ${dateRange}.\nProcessing in the background...`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    } catch (error) {
      console.error('Error syncing inbox:', error);
      alert('❌ Failed to start inbox scan. Please try again.');
    } finally {
      setSyncingInboxId(null);
    }
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'gmail':
        return <Mail className="h-6 w-6 text-red-500" />;
      case 'outlook':
        return <Mail className="h-6 w-6 text-blue-500" />;
      default:
        return <Mail className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Accounts</h1>
              <p className="text-lg text-gray-600">Connect your email accounts to automatically scan for invoices and receipts</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <EmailAccountInviteButton />
              <button 
                onClick={() => handleLinkAccount('gmail')}
                disabled={isLinking}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} />
                {isLinking ? 'Connecting...' : 'Connect Gmail Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 text-lg">Secure Connection</h3>
                <p className="text-blue-700">OAuth 2.0 protected authentication</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 text-lg">Smart Scanning</h3>
                <p className="text-green-700">AI-powered invoice detection</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 text-lg">Historical Sync</h3>
                <p className="text-purple-700">Import past invoices automatically</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Connected Email Accounts</h2>
            <p className="text-gray-600 mt-1">Manage your connected email accounts and scanning preferences</p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading email accounts...</p>
                </div>
              </div>
            ) : emailAccounts?.email_accounts?.length > 0 ? (
              <div className="space-y-6">
                {emailAccounts.email_accounts.map((account: any, index: number) => (
                  <div key={`account-${account.id || index}`} className="border border-gray-200 rounded-xl overflow-hidden">
                    
                    {/* Account Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            {getProviderIcon(account.provider)}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{account.email}</h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-600 capitalize font-medium">{account.provider}</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(account.status)}`}>
                                {account.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(account.status)}
                          <button
                            onClick={() => deleteMutation.mutate(account.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Account Content */}
                    <div className="p-6 space-y-6">
                      
                      {/* Date Range Selector */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-blue-900 mb-1">📅 Scan Date Range</h4>
                            <p className="text-blue-700">Choose how far back to scan for invoices</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[1, 2, 3].map(months => (
                              <button
                                key={months}
                                onClick={() => setDateRangeForAccount(account.id, months)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  getDateRange(account.id) === months
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-100'
                                }`}
                              >
                                {months} {months === 1 ? 'Month' : 'Months'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>


                      {/* Action Buttons */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleSyncInbox(account.id)}
                          disabled={syncingInboxId === account.id}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                          title={syncingInboxId === account.id ? 'Scanning in progress...' : `Start inbox scan for invoices from the last ${getDateRange(account.id)} month${getDateRange(account.id) > 1 ? 's' : ''}`}
                        >
                          <RefreshCw size={18} className={syncingInboxId === account.id ? 'animate-spin' : ''} />
                          {syncingInboxId === account.id ? 'Starting Scan...' : 'Scan Inbox'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Email Accounts Connected</h3>
                  <p className="text-gray-600 mb-6">Connect your first email account to start scanning for invoices</p>
                  <button 
                    onClick={() => handleLinkAccount('gmail')}
                    disabled={isLinking}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                  >
                    <Plus size={20} />
                    {isLinking ? 'Connecting...' : 'Connect Gmail Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAccounts; 
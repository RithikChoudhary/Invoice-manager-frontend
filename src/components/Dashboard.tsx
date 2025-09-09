import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  FileText, 
  Settings as SettingsIcon, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Filter,
  Zap,
  TrendingUp,
  ArrowRight,
  DollarSign,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardStats {
  totalInvoices: number;
  totalEmailAccounts: number;
  recentInvoices: any[];
  emailAccounts: any[];
  totalAmount: number;
  connectedAccounts: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalEmailAccounts: 0,
    recentInvoices: [],
    emailAccounts: [],
    totalAmount: 0,
    connectedAccounts: 0
  });
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadDashboardData();
      loadUserPreferences();
      
      // Set up real-time data refresh every 30 seconds
      const interval = setInterval(() => {
        loadDashboardData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats from backend API
      const [dashboardResponse, accountsResponse] = await Promise.allSettled([
        api.get('/api/dashboard/stats'),
        api.get('/api/email-accounts/')
      ]);

      // Handle Promise.allSettled results
      const dashboardData = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value.data : {};
      const accountsData = accountsResponse.status === 'fulfilled' ? accountsResponse.value.data : [];
      const accounts = Array.isArray(accountsData) ? accountsData : [];
      
      // Debug logging
      console.log('Dashboard response status:', dashboardResponse.status);
      console.log('Accounts response status:', accountsResponse.status);
      console.log('Dashboard data:', dashboardData);
      console.log('Accounts data:', accountsData);
      console.log('Processed accounts:', accounts);

      // Count connected accounts
      const connectedAccounts = accounts.filter((account: any) => account.status === 'connected').length;

      // If dashboard API failed, try fallback to individual APIs
      let finalStats = {
        totalInvoices: dashboardData?.invoices_count || 0,
        totalEmailAccounts: dashboardData?.email_accounts_count || 0,
        recentInvoices: Array.isArray(dashboardData?.recent_invoices) ? dashboardData.recent_invoices : [],
        emailAccounts: accounts,
        totalAmount: dashboardData?.total_amount || 0,
        connectedAccounts: connectedAccounts
      };

      // Fallback if dashboard API failed
      if (dashboardResponse.status !== 'fulfilled') {
        console.log('Dashboard API failed, using fallback...');
        try {
          const [invoicesResponse, summaryResponse] = await Promise.allSettled([
            api.get('/api/invoices/?page=1&page_size=5'),
            api.get('/api/invoices/summary')
          ]);

          const invoices = invoicesResponse.status === 'fulfilled' ? invoicesResponse.value.data : {};
          const summary = summaryResponse.status === 'fulfilled' ? summaryResponse.value.data : {};

          finalStats = {
            totalInvoices: invoices?.total || 0,
            totalEmailAccounts: accounts.length,
            recentInvoices: Array.isArray(invoices?.invoices) ? invoices.invoices : [],
            emailAccounts: accounts,
            totalAmount: summary?.total_amount || 0,
            connectedAccounts: connectedAccounts
          };
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError);
        }
      }

      setStats(finalStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await api.get('/api/vendors/user-preferences');
      if (response.data.success && response.data.data) {
        setUserPreferences(response.data.data);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, animationDelay = 0 }: any) => (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1 animate-pulse group-hover:animate-none">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  const ActionCard = ({ title, description, icon: Icon, onClick, buttonText, color, animationDelay = 0 }: any) => (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-4 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
          <button
            onClick={onClick}
            className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Sparkles className="h-8 w-8 mr-3 animate-pulse" />
                Dashboard
              </h1>
              <p className="text-blue-100 text-lg">Welcome back, {user?.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-blue-100">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadDashboardData()}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices.toLocaleString()}
            icon={FileText}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="Real-time data"
            animationDelay={100}
          />
          <StatCard
            title="Total Amount"
            value={`$${stats.totalAmount.toLocaleString()}`}
            icon={DollarSign}
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle="All time"
            animationDelay={200}
          />
          <StatCard
            title="Email Accounts"
            value={stats.totalEmailAccounts}
            icon={Mail}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle="Total accounts"
            animationDelay={300}
          />
          <StatCard
            title="Connected"
            value={stats.connectedAccounts}
            icon={Users}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            subtitle="Active accounts"
            animationDelay={400}
          />
        </div>

        {/* Vendor Scanning Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Zap className="h-5 w-5 text-blue-600 mr-2" />
                AI-Powered Invoice Scanning
              </h2>
              <p className="text-gray-600 mt-1">
                Your selected vendors are configured for automatic invoice scanning
              </p>
            </div>
          </div>

          {userPreferences?.selected_vendors?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {userPreferences.selected_vendors.length} vendors selected
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {userPreferences.selected_vendors.slice(0, 5).map((vendor: any, index: number) => (
                      <div
                        key={index}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-xs font-medium border-2 border-white hover:scale-110 transition-transform duration-200"
                        title={vendor.vendor_name}
                      >
                        {vendor.vendor_name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {userPreferences.selected_vendors.length > 5 && (
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border-2 border-white">
                        +{userPreferences.selected_vendors.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI Scanning Active</p>
                    <p className="text-xs text-gray-600">Invoices will be automatically detected and processed</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Vendors Selected</h3>
              <p className="text-gray-600 mb-4">
                Select vendors to enable AI-powered invoice scanning
              </p>
              <button
                onClick={() => navigate('/vendor-preferences')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Configure Vendors
              </button>
            </div>
          )}
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Manage Email Accounts"
            description="Connect and configure your email accounts for invoice scanning"
            icon={Mail}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            buttonText="Manage Accounts"
            onClick={() => navigate('/email-accounts')}
            animationDelay={100}
          />
          <ActionCard
            title="View All Invoices"
            description="Browse, search, and manage your collected invoices"
            icon={FileText}
            color="bg-gradient-to-br from-green-500 to-green-600"
            buttonText="View Invoices"
            onClick={() => navigate('/invoices')}
            animationDelay={200}
          />
          <ActionCard
            title="Vendor Preferences"
            description="Configure which vendors to scan for invoices"
            icon={SettingsIcon}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            buttonText="Configure Vendors"
            onClick={() => navigate('/vendor-preferences')}
            animationDelay={300}
          />
        </div>

        {/* Recent Invoices */}
        {stats.recentInvoices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Recent Invoices
                </h2>
                <button
                  onClick={() => navigate('/invoices')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
                >
                  View all →
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentInvoices.slice(0, 5).map((invoice: any, index: number) => (
                <div 
                  key={invoice._id || invoice.id} 
                  className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {invoice.vendor_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {invoice.invoice_number || 'No invoice number'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        ${invoice.total_amount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
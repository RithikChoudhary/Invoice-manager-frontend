import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { invoicesAPI } from '../services/api';
import InvoiceHierarchy from './InvoiceHierarchy';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  Building,
  Tag,
  ChevronLeft,
  ChevronRight,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  SortAsc,
  SortDesc,
  // MoreVertical,
  List,
  FolderTree
} from 'lucide-react';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<any>('hierarchy');
  const [filters, setFilters] = useState({
    vendor_name: '',
    category: '',
    status: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
    source_type: '',
    source_group_email: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('invoice_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices', currentPage, filters, sortBy, sortOrder],
    queryFn: () => invoicesAPI.getAll({ 
      page: currentPage, 
      page_size: 20,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...filters 
    }),
  });

  // Get stats for correct total amount
  const { data: stats } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => invoicesAPI.getStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (invoiceId: string) => invoicesAPI.delete(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSelectedInvoices(prev => prev.filter(id => id !== deleteMutation.variables));
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDelete = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteMutation.mutate(invoiceId);
    }
  };

  const handleBulkDelete = () => {
    if (selectedInvoices.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedInvoices.length} selected invoices? This action cannot be undone.`)) {
      selectedInvoices.forEach(id => deleteMutation.mutate(id));
      setSelectedInvoices([]);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices?.invoices?.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices?.invoices?.map((inv: any) => inv.id) || []);
    }
  };

  const clearFilters = () => {
    setFilters({
      vendor_name: '',
      category: '',
      status: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: '',
      source_type: '',
      source_group_email: '',
    });
    setCurrentPage(1);
  };

  const handleExport = () => {
    try {
      const invoiceData = invoices?.invoices || [];
      const data = [
        'Date,Vendor,Amount,Status,Category,Invoice Number,Source,Group Email',
        ...invoiceData.map((invoice: any) => 
          `${new Date(invoice.invoice_date).toLocaleDateString()},${invoice.vendor_name},$${invoice.total_amount},${invoice.status},${invoice.category || 'N/A'},${invoice.invoice_number || 'N/A'},${invoice.source_type || 'email'},${invoice.source_group_email || 'N/A'}`
        )
      ].join('\n');
      
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert('Invoices exported successfully!');
    } catch (error) {
      alert('Export failed. Please try again.');
    }
  };

  const handleImport = () => {
    alert('Import functionality coming soon! You can manually add invoices or connect email accounts to scan for invoices automatically.');
  };

  const handleAddInvoice = () => {
    alert('Add Invoice functionality coming soon! For now, you can connect email accounts to automatically scan for invoices.');
  };

  const handleViewInvoice = (invoice: any) => {
    if (invoice.drive_view_link) {
      // Open Drive link in new tab
      window.open(invoice.drive_view_link, '_blank');
    } else if (invoice.local_file_path) {
      // Fallback to local file if no Drive link
      alert('Invoice file is available locally but Drive link is not available.');
    } else {
      // No file available
      alert('No invoice file available for viewing.');
    }
  };

  const handleEditInvoice = (invoiceId: string) => {
    alert(`Edit invoice ${invoiceId} - Feature coming soon!`);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    try {
      invoicesAPI.download(invoiceId);
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const totalValue = stats?.total_amount || 0;  // Use API total_amount instead of calculating from current page
  const pendingCount = invoices?.invoices?.filter((inv: any) => inv.status === 'pending').length || 0;
  const uniqueVendors = new Set(invoices?.invoices?.map((inv: any) => inv.vendor_name)).size || 0;

  // If hierarchy view is selected, render the hierarchy component
  if (viewMode === 'hierarchy') {
    return <InvoiceHierarchy />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="mt-2 text-gray-600">Manage and track all your invoices in one place</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('hierarchy')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'hierarchy' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FolderTree className="h-4 w-4" />
                  Folder View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List View
                </button>
              </div>
              
              <button 
                onClick={() => refetch()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button 
                onClick={handleImport}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button 
                onClick={handleAddInvoice}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices?.total || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueVendors}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.vendor_name}
                  onChange={(e) => handleFilterChange('vendor_name', e.target.value)}
                  placeholder="Search by vendor name, invoice number, or amount..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg font-medium transition-colors ${
                    showFilters || hasActiveFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-3 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">All Categories</option>
                      <option value="utilities">Utilities</option>
                      <option value="services">Services</option>
                      <option value="products">Products</option>
                      <option value="software">Software</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processed">Processed</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <select
                      value={filters.source_type}
                      onChange={(e) => handleFilterChange('source_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">All Sources</option>
                      <option value="email">Direct Email</option>
                      <option value="group">Google Group</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Email</label>
                    <input
                      type="text"
                      placeholder="Filter by group email..."
                      value={filters.source_group_email}
                      onChange={(e) => handleFilterChange('source_group_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                    <input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                    <input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  All Invoices
                  {invoices?.total && <span className="text-gray-500 ml-2">({invoices.total})</span>}
                </h2>
                {selectedInvoices.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedInvoices.length})
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSort('invoice_date')}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sort by Date
                  {sortBy === 'invoice_date' && (
                    sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('total_amount')}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sort by Amount
                  {sortBy === 'total_amount' && (
                    sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Loading invoices...</span>
              </div>
            ) : invoices?.invoices && invoices.invoices.length > 0 ? (
              <div className="space-y-3">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === invoices.invoices.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedInvoices.length === invoices.invoices.length ? 'Deselect All' : 'Select All'}
                  </span>
                </div>

                {invoices.invoices.map((invoice: any) => (
                  <div 
                    key={invoice.id} 
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedInvoices.includes(invoice.id) 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {invoice.vendor_name || 'Unknown Vendor'}
                            </h3>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(invoice.status)}
                              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                                {invoice.status || 'unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {invoice.invoice_number && (
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                #{invoice.invoice_number}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(invoice.invoice_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {invoice.category && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                {invoice.category}
                              </span>
                            )}
                            {/* Source badge */}
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              invoice.source_type === 'group' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {invoice.source_type === 'group' ? '👥 Group' : '📧 Email'}
                              {invoice.source_group_email && `: ${invoice.source_group_email}`}
                            </span>
                            
                            {/* Drive availability badge */}
                            {invoice.drive_view_link && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-md text-xs font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                </svg>
                                Drive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            ${invoice.total_amount?.toLocaleString() || '0.00'}
                          </p>
                          <p className="text-sm text-gray-500">USD</p>
                        </div>

                        <div className="flex items-center space-x-1 relative">
                          <button 
                            onClick={() => handleViewInvoice(invoice)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              invoice.drive_view_link 
                                ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                            title={
                              invoice.drive_view_link 
                                ? 'View Invoice in Google Drive' 
                                : 'No invoice file available'
                            }
                          >
                            <Eye className="h-4 w-4" />
                            {invoice.drive_view_link && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </button>
                          <button 
                            onClick={() => handleEditInvoice(invoice.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Edit Invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to find more invoices.'
                    : 'Start by connecting an email account or adding invoices manually.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={handleAddInvoice}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Invoice
                  </button>
                  <button 
                    onClick={handleImport}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Upload className="h-4 w-4" />
                    Import Invoices
                  </button>
                  <button 
                    onClick={() => navigate('/email-accounts')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Connect Email Accounts
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {invoices && invoices.total_pages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 20, invoices.total)}</span> of{' '}
                  <span className="font-medium">{invoices.total}</span> invoices
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, invoices.total_pages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(invoices.total_pages, prev + 1))}
                    disabled={currentPage === invoices.total_pages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
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

export default Invoices; 
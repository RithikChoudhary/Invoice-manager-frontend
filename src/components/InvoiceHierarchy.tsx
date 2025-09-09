import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesAPI } from '../services/api';
import { 
  FileText, 
  Folder,
  ChevronRight,
  ChevronDown,
  Mail,
  Calendar,
  Tag,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Invoice {
  id: string;
  vendor_name: string;
  total_amount: number;
  invoice_date: string | null;
  status: string;
  invoice_number?: string;
  category?: string;
  source_type: string;
  source_group_email?: string;
  drive_view_link?: string;
  local_file_path?: string;
}

// interface Month {
//   month: string;
//   invoices: Invoice[];
// }

// interface EmailAccount {
//   email: string;
//   months: { [key: string]: Month };
// }

// interface HierarchyData {
//   invoice_manager: {
//     invoices: { [key: string]: EmailAccount };
//   };
// }

type ViewLevel = 'root' | 'emails' | 'months' | 'invoices';

interface BreadcrumbItem {
  level: ViewLevel;
  label: string;
  email?: string;
  month?: string;
}

const InvoiceHierarchy: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewLevel>('root');
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  // const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const { data: hierarchyData, isLoading, refetch } = useQuery({
    queryKey: ['invoice-hierarchy'],
    queryFn: () => invoicesAPI.getHierarchy(),
  });

  // const handleEmailClick = (email: string) => {
  //   setSelectedEmail(email);
  //   setCurrentView('emails');
  //   setBreadcrumbs([
  //     { level: 'root', label: 'Invoice Manager' },
  //     { level: 'emails', label: 'Invoices' },
  //     { level: 'months', label: email }
  //   ]);
  // };

  // const handleMonthClick = (month: string) => {
  //   setSelectedMonth(month);
  //   setCurrentView('months');
  //   setBreadcrumbs([
  //     { level: 'root', label: 'Invoice Manager' },
  //     { level: 'emails', label: 'Invoices' },
  //     { level: 'months', label: selectedEmail },
  //     { level: 'invoices', label: month }
  //   ]);
  // };

  const handleInvoiceClick = (invoice: Invoice) => {
    setCurrentView('invoices');
    setBreadcrumbs([
      { level: 'root', label: 'Invoice Manager' },
      { level: 'emails', label: 'Invoices' },
      { level: 'months', label: selectedEmail },
      { level: 'invoices', label: selectedMonth },
      { level: 'invoices', label: invoice.vendor_name }
    ]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetBreadcrumb = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    
    switch (targetBreadcrumb.level) {
      case 'root':
        setCurrentView('root');
        setSelectedEmail('');
        setSelectedMonth('');
        break;
      case 'emails':
        setCurrentView('emails');
        setSelectedEmail('');
        setSelectedMonth('');
        break;
      case 'months':
        setCurrentView('months');
        setSelectedEmail(targetBreadcrumb.email || '');
        setSelectedMonth('');
        break;
      case 'invoices':
        setCurrentView('invoices');
        setSelectedEmail(targetBreadcrumb.email || '');
        setSelectedMonth(targetBreadcrumb.month || '');
        break;
    }
  };

  const toggleEmailExpansion = (email: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(email)) {
      newExpanded.delete(email);
    } else {
      newExpanded.add(email);
    }
    setExpandedEmails(newExpanded);
  };

  const toggleMonthExpansion = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
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

  const renderRootView = () => {
    if (!hierarchyData?.invoice_manager?.invoices) return null;

    const emails = Object.values(hierarchyData.invoice_manager.invoices);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Folder className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Invoice Manager</h3>
            <p className="text-sm text-blue-700">Click on "Invoices" to view your invoice folders</p>
          </div>
        </div>
        
        <div 
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => setCurrentView('emails')}
        >
          <Folder className="h-6 w-6 text-gray-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Invoices</h3>
            <p className="text-sm text-gray-600">{emails.length} email accounts with invoices</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    );
  };

  const renderEmailsView = () => {
    if (!hierarchyData?.invoice_manager?.invoices) return null;

    const emails = Object.entries(hierarchyData.invoice_manager.invoices);
    
    return (
      <div className="space-y-2">
        {emails.map(([email, emailData]:any) => {
          const totalInvoices = Object.values(emailData.months).reduce(
            (sum, month:any) => sum + month.invoices.length, 0
          );
          const totalAmount:any = Object.values(emailData.months).reduce(
            (sum, month:any) => sum + month.invoices.reduce((monthSum:any, invoice:any) => monthSum + invoice.total_amount, 0), 0
          );
          const isExpanded = expandedEmails.has(email);
          
          return (
            <div key={email} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleEmailExpansion(email)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <Mail className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{email}</h3>
                  <p className="text-sm text-gray-600">
                    {totalInvoices} invoices • ${totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {Object.entries(emailData.months).map(([monthName, monthData]:any) => {
                    const isMonthExpanded = expandedMonths.has(monthName);
                    const monthTotal:any = monthData.invoices.reduce((sum:any, invoice:any) => sum + invoice.total_amount, 0);
                    
                    return (
                      <div key={monthName} className="border-b border-gray-200 last:border-b-0">
                        <div 
                          className="flex items-center gap-3 p-3 pl-8 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => toggleMonthExpansion(monthName)}
                        >
                          {isMonthExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{monthName}</h4>
                            <p className="text-sm text-gray-600">
                              {monthData.invoices.length} invoices • ${monthTotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {isMonthExpanded && (
                          <div className="pl-12 pr-4 pb-3">
                            <div className="space-y-2">
                              {monthData.invoices.map((invoice:any) => (
                                <div 
                                  key={invoice.id}
                                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => handleInvoiceClick(invoice)}
                                >
                                  <FileText className="h-4 w-4 text-gray-600" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-medium text-gray-900">{invoice.vendor_name}</h5>
                                      {getStatusIcon(invoice.status)}
                                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                                        {invoice.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      {invoice.invoice_number && (
                                        <span className="flex items-center gap-1">
                                          <Tag className="h-3 w-3" />
                                          #{invoice.invoice_number}
                                        </span>
                                      )}
                                      {invoice.invoice_date && (
                                        <span>
                                          {new Date(invoice.invoice_date).toLocaleDateString()}
                                        </span>
                                      )}
                                      <span className="font-medium text-green-600">
                                        ${invoice.total_amount.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {invoice.drive_view_link && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(invoice.drive_view_link, '_blank');
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        title="View in Drive"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle download
                                      }}
                                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                      title="Download"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`hover:text-blue-600 transition-colors ${
                index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : ''
              }`}
            >
              {breadcrumb.label}
            </button>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Loading invoice hierarchy...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Manager</h1>
              <p className="mt-2 text-gray-600">Browse your invoices organized by email accounts and months</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => refetch()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            {currentView === 'root' && renderRootView()}
            {currentView === 'emails' && renderEmailsView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHierarchy;
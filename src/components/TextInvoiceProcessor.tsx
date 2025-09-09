import React, { useState } from 'react';
import { 
  FileText, 
  Mail, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  DollarSign,
  Calendar,
  Hash
} from 'lucide-react';
import api from '../services/api';

interface TextInvoiceData {
  subject: string;
  body: string;
  sender: string;
  date: string;
  message_id: string;
  email_account_id: string;
}

interface ProcessedInvoice {
  id: string;
  vendor_name: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
  invoice_date: string;
  status: string;
}

const TextInvoiceProcessor: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<TextInvoiceData>({
    subject: '',
    body: '',
    sender: '',
    date: '',
    message_id: '',
    email_account_id: ''
  });
  
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof TextInvoiceData, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processTextInvoice = async () => {
    if (!invoiceData.subject || !invoiceData.body) {
      setError('Subject and email body are required');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/invoices/process-text-invoice', invoiceData);
      
      if (response.data.success) {
        setResult(response.data.invoice);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to process invoice');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process invoice');
    } finally {
      setProcessing(false);
    }
  };

  const clearForm = () => {
    setInvoiceData({
      subject: '',
      body: '',
      sender: '',
      date: '',
      message_id: '',
      email_account_id: ''
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Text-Based Invoice Processor</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Process invoices from email content when there are no PDF attachments. 
          Extract vendor information, amounts, dates, and invoice numbers using AI-powered analysis.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-blue-600" />
          Email Content
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={invoiceData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Invoice subject line"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender
            </label>
            <input
              type="text"
              value={invoiceData.sender}
              onChange={(e) => handleInputChange('sender', e.target.value)}
              placeholder="sender@company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={invoiceData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message ID
            </label>
            <input
              type="text"
              value={invoiceData.message_id}
              onChange={(e) => handleInputChange('message_id', e.target.value)}
              placeholder="Optional message ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Account ID
            </label>
            <input
              type="text"
              value={invoiceData.email_account_id}
              onChange={(e) => handleInputChange('email_account_id', e.target.value)}
              placeholder="Optional account ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body *
          </label>
          <textarea
            value={invoiceData.body}
            onChange={(e) => handleInputChange('body', e.target.value)}
            placeholder="Paste the email content here. The AI will analyze this to extract invoice information."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={clearForm}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Clear Form
          </button>

          <button
            onClick={processTextInvoice}
            disabled={processing || !invoiceData.subject || !invoiceData.body}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Process Invoice
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-green-800">
              Invoice Processed Successfully!
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <Hash className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Invoice ID:</span>
                <span className="ml-2 text-sm text-gray-900">{result.id}</span>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Vendor:</span>
                <span className="ml-2 text-sm text-gray-900">{result.vendor_name}</span>
              </div>

              <div className="flex items-center">
                <Hash className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Invoice Number:</span>
                <span className="ml-2 text-sm text-gray-900">{result.invoice_number || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Amount:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {result.currency} {result.total_amount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {new Date(result.invoice_date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-sm text-gray-900 capitalize">{result.status}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <button
              onClick={clearForm}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Process Another Invoice
            </button>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How It Works</h3>
        <div className="space-y-2 text-blue-700">
          <p>• <strong>AI Analysis:</strong> Our Gemini AI analyzes email content to extract invoice details</p>
          <p>• <strong>Text Recognition:</strong> Identifies vendor names, amounts, dates, and invoice numbers</p>
          <p>• <strong>Fallback Processing:</strong> Uses regex patterns if AI extraction fails</p>
          <p>• <strong>Automatic Generation:</strong> Creates invoice records even without PDF attachments</p>
        </div>
      </div>
    </div>
  );
};

export default TextInvoiceProcessor; 
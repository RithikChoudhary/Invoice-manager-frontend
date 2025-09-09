import React, { useState, useEffect } from 'react';
import { useGemini } from './useGemini';
import { FileText, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const GeminiExample: React.FC = () => {
  const [invoiceText, setInvoiceText] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [validation, setValidation] = useState<any>(null);

  const {
    isLoading,
    error,
    isInitialized,
    initialize,
    extractInvoiceData,
    categorizeInvoice,
    summarizeInvoice,
    validateInvoiceData,
    clearError
  } = useGemini({
    onError: (error) => {
      console.error('Gemini Error:', error);
    }
  });

  // Initialize Gemini on component mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  const handleExtractInvoice = async () => {
    if (!invoiceText.trim()) {
      alert('Please enter invoice text');
      return;
    }

    try {
      clearError();
      
      // Extract invoice data
      const data = await extractInvoiceData(invoiceText);
      setExtractedData(data);

      // Categorize the invoice
      const categoryData = await categorizeInvoice(data.vendor, data.amount);
      setCategory(categoryData);

      // Generate summary
      const summaryText = await summarizeInvoice({
        vendor: data.vendor,
        amount: data.amount,
        date: data.date,
        category: categoryData.category
      });
      setSummary(summaryText);

      // Validate the data
      const validationResult = await validateInvoiceData(data);
      setValidation(validationResult);

    } catch (error) {
      console.error('Failed to process invoice:', error);
    }
  };

  const sampleInvoiceText = `INVOICE

Invoice #: INV-2024-001
Date: 2024-01-15
Due Date: 2024-02-15

From: TechCorp Solutions
123 Business Street
San Francisco, CA 94105

To: Invoice Manager Inc.
456 Corporate Ave
New York, NY 10001

Description:
- Software License (Annual): $2,400.00
- Technical Support: $500.00
- Implementation Services: $1,200.00

Subtotal: $4,100.00
Tax (8.5%): $348.50
Total: $4,448.50

Payment Terms: Net 30
Currency: USD`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Gemini AI Invoice Processing
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Test the Gemini AI integration for invoice data extraction and processing
        </p>
      </div>

      {/* Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {isInitialized ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
          )}
          <span className="text-sm font-medium">
            {isInitialized ? 'Gemini AI Ready' : 'Initializing Gemini AI...'}
          </span>
        </div>
        {error && (
          <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Invoice Text Input
        </h3>
        
        <div className="space-y-4">
          <textarea
            value={invoiceText}
            onChange={(e) => setInvoiceText(e.target.value)}
            placeholder="Paste your invoice text here..."
            className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          
          <div className="flex space-x-4">
            <button
              onClick={() => setInvoiceText(sampleInvoiceText)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Load Sample Invoice
            </button>
            
            <button
              onClick={handleExtractInvoice}
              disabled={!isInitialized || isLoading || !invoiceText.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Process Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {extractedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Extracted Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Extracted Data
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendor:</span>
                <p className="text-gray-900 dark:text-white">{extractedData.vendor}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</span>
                <p className="text-gray-900 dark:text-white">{extractedData.currency} {extractedData.amount}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date:</span>
                <p className="text-gray-900 dark:text-white">{extractedData.date}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice #:</span>
                <p className="text-gray-900 dark:text-white">{extractedData.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Category & Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              AI Analysis
            </h3>
            <div className="space-y-4">
              {category && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</span>
                  <p className="text-gray-900 dark:text-white">{category.category} ({(category.confidence * 100).toFixed(1)}% confidence)</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {category.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {summary && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Summary:</span>
                  <p className="text-gray-900 dark:text-white">{summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validation && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Validation Results
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                {validation.isValid ? 'Valid Invoice' : 'Invalid Invoice'}
              </span>
            </div>
            
            {validation.errors.length > 0 && (
              <div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Errors:</span>
                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-1">
                  {validation.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Warnings:</span>
                <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  {validation.warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiExample; 
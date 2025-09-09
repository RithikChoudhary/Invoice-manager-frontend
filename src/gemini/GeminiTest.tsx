import React, { useState } from 'react';
import { useGemini } from './useGemini';
import { Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const GeminiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('');

  const { 
    isInitialized, 
    error, 
    generateText, 
    clearError 
  } = useGemini();

  // Check API key on mount
  React.useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      setApiKeyStatus(`API Key found: ${apiKey.substring(0, 10)}...`);
    } else {
      setApiKeyStatus('No API key found in environment variables');
    }
  }, []);

  const runTest = async () => {
    setIsTesting(true);
    clearError();
    
    try {
      const result = await generateText(
        "Say 'Hello from Gemini AI!' and confirm you're working properly.",
        { temperature: 0.7, maxTokens: 100 }
      );
      setTestResult(result);
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Gemini AI Test
      </h2>
      
      <div className="space-y-4">
        {/* API Key Status */}
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key Status:
          </span>
          <p className="text-sm text-gray-900 dark:text-white mt-1">
            {apiKeyStatus}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          {isInitialized ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
          )}
          <span className="text-sm">
            {isInitialized ? 'Ready' : 'Initializing...'}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Test Button */}
        <button
          onClick={runTest}
          disabled={!isInitialized || isTesting}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isTesting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{isTesting ? 'Testing...' : 'Test Gemini AI'}</span>
        </button>

        {/* Test Result */}
        {testResult && (
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Result:
            </h3>
            <p className="text-sm text-gray-900 dark:text-white">
              {testResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiTest; 
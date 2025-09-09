import { useState, useCallback } from 'react';
import { initializeGeminiService, getGeminiService } from './geminiService';
import { validateGeminiConfig, GEMINI_ERROR_MESSAGES } from './gemini';

interface UseGeminiOptions {
  apiKey?: string;
  onError?: (error: string) => void;
}

interface GeminiState {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface InvoiceData {
  vendor: string;
  amount: number;
  date: string;
  invoiceNumber: string;
  currency: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface InvoiceCategory {
  category: string;
  confidence: number;
  tags: string[];
}

export const useGemini = (options: UseGeminiOptions = {}) => {
  const [state, setState] = useState<GeminiState>({
    isLoading: false,
    error: null,
    isInitialized: false
  });

  // Initialize Gemini service
  const initialize = useCallback(async (apiKey?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const key = apiKey || options.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!key) {
        throw new Error(GEMINI_ERROR_MESSAGES.API_KEY_MISSING);
      }

      if (!validateGeminiConfig()) {
        throw new Error(GEMINI_ERROR_MESSAGES.API_KEY_MISSING);
      }

      initializeGeminiService(key);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isInitialized: true,
        error: null 
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Gemini service';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      options.onError?.(errorMessage);
      return false;
    }
  }, [options]);

  // Generate text
  const generateText = useCallback(async (
    prompt: string,
    generationOptions?: {
      temperature?: number;
      maxTokens?: number;
      topK?: number;
      topP?: number;
    }
  ): Promise<string> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const service = getGeminiService();
      const result = await service.generateText(prompt, generationOptions);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate text';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  // Extract invoice data
  const extractInvoiceData = useCallback(async (invoiceText: string): Promise<InvoiceData> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const service = getGeminiService();
      const result = await service.extractInvoiceData(invoiceText);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract invoice data';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  // Categorize invoice
  const categorizeInvoice = useCallback(async (
    vendorName: string, 
    amount: number, 
    description?: string
  ): Promise<InvoiceCategory> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const service = getGeminiService();
      const result = await service.categorizeInvoice(vendorName, amount, description);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to categorize invoice';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  // Summarize invoice
  const summarizeInvoice = useCallback(async (invoiceData: {
    vendor: string;
    amount: number;
    date: string;
    category: string;
  }): Promise<string> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const service = getGeminiService();
      const result = await service.summarizeInvoice(invoiceData);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to summarize invoice';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  // Validate invoice data
  const validateInvoiceData = useCallback(async (invoiceData: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const service = getGeminiService();
      const result = await service.validateInvoiceData(invoiceData);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate invoice data';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    
    // Actions
    initialize,
    generateText,
    extractInvoiceData,
    categorizeInvoice,
    summarizeInvoice,
    validateInvoiceData,
    clearError,
  };
}; 
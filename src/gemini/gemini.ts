// Gemini API Configuration
export const GEMINI_CONFIG = {
  // API Key - should be set via environment variable
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Model configuration
  MODEL: 'gemini-1.5-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1',
  
  // Default generation settings
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2048,
  DEFAULT_TOP_K: 40,
  DEFAULT_TOP_P: 0.95,
  
  // Invoice processing settings
  INVOICE_EXTRACTION_TEMPERATURE: 0.1, // Lower for more consistent extraction
  INVOICE_CATEGORIZATION_TEMPERATURE: 0.3,
  INVOICE_SUMMARIZATION_TEMPERATURE: 0.5,
  
  // Rate limiting (requests per minute)
  RATE_LIMIT: 60,
  
  // Timeout settings
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Environment validation
export const validateGeminiConfig = (): boolean => {
  if (!GEMINI_CONFIG.API_KEY) {
    console.error('Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable.');
    return false;
  }
  return true;
};

// Invoice categories for consistent categorization
export const INVOICE_CATEGORIES = [
  'Software',
  'Hardware', 
  'Services',
  'Travel',
  'Office',
  'Marketing',
  'Legal',
  'Consulting',
  'Utilities',
  'Other'
] as const;

export type InvoiceCategory = typeof INVOICE_CATEGORIES[number];

// Invoice validation rules
export const INVOICE_VALIDATION_RULES = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000,
  REQUIRED_FIELDS: ['vendor', 'amount', 'date'],
  DATE_FORMAT: 'YYYY-MM-DD',
  CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY']
} as const;

// Error messages
export const GEMINI_ERROR_MESSAGES = {
  API_KEY_MISSING: 'Gemini API key is required. Please set VITE_GEMINI_API_KEY environment variable.',
  INVALID_RESPONSE: 'Invalid response from Gemini API',
  EXTRACTION_FAILED: 'Failed to extract invoice data',
  VALIDATION_FAILED: 'Invoice validation failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const; 
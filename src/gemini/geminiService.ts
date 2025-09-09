interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: {
    category: string;
    threshold: string;
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    index: number;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  promptFeedback?: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

interface GeminiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate text using Gemini API
   */
  async generateText(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      topK?: number;
      topP?: number;
    } = {}
  ): Promise<string> {
    try {
      const request: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          topK: options.topK ?? 40,
          topP: options.topP ?? 0.95,
          maxOutputTokens: options.maxTokens ?? 4096
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData: GeminiError = await response.json();
        throw new Error(`Gemini API Error: ${errorData.error.message}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  /**
   * Extract invoice data from text using Gemini
   */
  async extractInvoiceData(invoiceText: string): Promise<{
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
  }> {
    const prompt = `
    Extract invoice data from the following text and return it as JSON. 
    Focus on: vendor name, total amount, invoice date, invoice number, currency, and line items if available.
    
    Invoice text:
    ${invoiceText}
    
    Return only valid JSON with this structure:
    {
      "vendor": "string",
      "amount": number,
      "date": "YYYY-MM-DD",
      "invoiceNumber": "string",
      "currency": "string",
      "items": [
        {
          "description": "string",
          "quantity": number,
          "unitPrice": number,
          "total": number
        }
      ]
    }
    `;

    try {
      const response = await this.generateText(prompt, {
        temperature: 0.1, // Lower temperature for more consistent extraction
        maxTokens: 1000
      });

      // Try to parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!extractedData.vendor || !extractedData.amount || !extractedData.date) {
        throw new Error('Missing required invoice fields');
      }

      return extractedData;
    } catch (error) {
      console.error('Invoice extraction error:', error);
      throw new Error(`Failed to extract invoice data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Categorize invoice by vendor type
   */
  async categorizeInvoice(vendorName: string, amount: number, description?: string): Promise<{
    category: string;
    confidence: number;
    tags: string[];
  }> {
    const prompt = `
    Categorize this invoice based on the vendor and amount. Return JSON with category, confidence (0-1), and relevant tags.
    
    Vendor: ${vendorName}
    Amount: ${amount}
    Description: ${description || 'N/A'}
    
    Categories: Software, Hardware, Services, Travel, Office, Marketing, Legal, Consulting, Utilities, Other
    
    Return JSON:
    {
      "category": "string",
      "confidence": number,
      "tags": ["string"]
    }
    `;

    try {
      const response = await this.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 500
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Invoice categorization error:', error);
      return {
        category: 'Other',
        confidence: 0.5,
        tags: ['uncategorized']
      };
    }
  }

  /**
   * Summarize invoice for dashboard
   */
  async summarizeInvoice(invoiceData: {
    vendor: string;
    amount: number;
    date: string;
    category: string;
  }): Promise<string> {
    const prompt = `
    Create a brief, professional summary of this invoice for a dashboard display:
    
    Vendor: ${invoiceData.vendor}
    Amount: $${invoiceData.amount}
    Date: ${invoiceData.date}
    Category: ${invoiceData.category}
    
    Return a concise summary (max 100 characters) suitable for a dashboard card.
    `;

    try {
      const response = await this.generateText(prompt, {
        temperature: 0.5,
        maxTokens: 200
      });

      return response.trim();
    } catch (error) {
      console.error('Invoice summarization error:', error);
      return `${invoiceData.vendor} - $${invoiceData.amount}`;
    }
  }

  /**
   * Validate invoice data
   */
  async validateInvoiceData(invoiceData: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const prompt = `
    Validate this invoice data and return JSON with validation results:
    
    Invoice Data: ${JSON.stringify(invoiceData)}
    
    Check for:
    - Required fields (vendor, amount, date)
    - Valid date format
    - Reasonable amount values
    - Valid currency format
    
    Return JSON:
    {
      "isValid": boolean,
      "errors": ["string"],
      "warnings": ["string"]
    }
    `;

    try {
      const response = await this.generateText(prompt, {
        temperature: 0.1,
        maxTokens: 500
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Invoice validation error:', error);
      return {
        isValid: false,
        errors: ['Failed to validate invoice data'],
        warnings: []
      };
    }
  }
}

// Create and export a singleton instance
let geminiServiceInstance: GeminiService | null = null;

export const initializeGeminiService = (apiKey: string): GeminiService => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService(apiKey);
  }
  return geminiServiceInstance;
};

export const getGeminiService = (): GeminiService => {
  if (!geminiServiceInstance) {
    throw new Error('GeminiService not initialized. Call initializeGeminiService first.');
  }
  return geminiServiceInstance;
};

export default GeminiService; 
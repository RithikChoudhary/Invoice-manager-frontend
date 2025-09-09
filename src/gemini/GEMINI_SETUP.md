# Gemini AI Integration Setup

This guide explains how to set up and use the Gemini AI integration for invoice processing in the Invoice Manager application.

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```bash
# .env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your API key to version control. Add `.env` to your `.gitignore` file.

### 3. Usage Examples

#### Basic Text Generation

```typescript
import { useGemini } from './hooks/useGemini';

const MyComponent = () => {
  const { generateText, isLoading, error } = useGemini();

  const handleGenerate = async () => {
    try {
      const result = await generateText("Write a summary of invoice processing");
      console.log(result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={isLoading}>
      {isLoading ? 'Generating...' : 'Generate Text'}
    </button>
  );
};
```

#### Invoice Data Extraction

```typescript
import { useGemini } from './hooks/useGemini';

const InvoiceProcessor = () => {
  const { extractInvoiceData, categorizeInvoice, summarizeInvoice } = useGemini();

  const processInvoice = async (invoiceText: string) => {
    try {
      // Extract structured data
      const data = await extractInvoiceData(invoiceText);
      console.log('Extracted:', data);

      // Categorize the invoice
      const category = await categorizeInvoice(data.vendor, data.amount);
      console.log('Category:', category);

      // Generate summary
      const summary = await summarizeInvoice({
        vendor: data.vendor,
        amount: data.amount,
        date: data.date,
        category: category.category
      });
      console.log('Summary:', summary);

    } catch (error) {
      console.error('Processing failed:', error);
    }
  };

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
};
```

## API Methods

### Core Service Methods

- `generateText(prompt, options)` - Generate text with custom parameters
- `extractInvoiceData(invoiceText)` - Extract structured invoice data
- `categorizeInvoice(vendor, amount, description?)` - Categorize invoice by type
- `summarizeInvoice(invoiceData)` - Generate dashboard summary
- `validateInvoiceData(invoiceData)` - Validate extracted data

### Hook State

- `isLoading` - Loading state for any operation
- `error` - Current error message
- `isInitialized` - Whether Gemini service is ready
- `clearError()` - Clear current error

## Configuration Options

### Generation Parameters

```typescript
const options = {
  temperature: 0.7,    // 0.0-1.0 (creativity)
  maxTokens: 2048,     // Maximum response length
  topK: 40,           // Top-k sampling
  topP: 0.95          // Nucleus sampling
};
```

### Invoice Processing Settings

- **Extraction**: Low temperature (0.1) for consistent results
- **Categorization**: Medium temperature (0.3) for balanced accuracy
- **Summarization**: Higher temperature (0.5) for creative summaries

## Error Handling

The service includes comprehensive error handling:

```typescript
const { error, onError } = useGemini({
  onError: (errorMessage) => {
    // Handle errors (show toast, log, etc.)
    console.error('Gemini Error:', errorMessage);
  }
});
```

## Rate Limiting

The service includes built-in rate limiting:
- 60 requests per minute
- Automatic retry with exponential backoff
- Request timeout of 30 seconds

## Security Notes

1. **API Key Security**: Never expose your API key in client-side code
2. **Environment Variables**: Use Vite's `import.meta.env` for environment variables
3. **CORS**: Ensure your domain is allowed in Google AI Studio
4. **Rate Limits**: Monitor usage to avoid hitting rate limits

## Testing

Use the `GeminiExample` component to test the integration:

```typescript
import GeminiExample from './components/GeminiExample';

// Add to your routes or pages
<GeminiExample />
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `.env` file exists in frontend directory
   - Check that `VITE_GEMINI_API_KEY` is set correctly
   - Restart development server after adding environment variables

2. **CORS Errors**
   - Add your domain to Google AI Studio allowed origins
   - Check browser console for CORS error details

3. **Rate Limit Exceeded**
   - Implement exponential backoff
   - Monitor API usage in Google AI Studio
   - Consider caching responses

4. **Invalid Response Format**
   - Check that prompts return valid JSON
   - Add error handling for malformed responses
   - Validate extracted data before use

### Debug Mode

Enable debug logging by setting:

```typescript
// In your component
const { generateText } = useGemini({
  onError: (error) => {
    console.log('Debug - Gemini Error:', error);
  }
});
```

## Advanced Usage

### Custom Prompts

```typescript
const customPrompt = `
Extract the following information from this invoice:
- Vendor name
- Total amount
- Invoice date
- Payment terms

Invoice: ${invoiceText}

Return as JSON only.
`;

const result = await generateText(customPrompt, {
  temperature: 0.1,
  maxTokens: 500
});
```

### Batch Processing

```typescript
const processMultipleInvoices = async (invoices: string[]) => {
  const results = [];
  
  for (const invoice of invoices) {
    try {
      const data = await extractInvoiceData(invoice);
      results.push({ success: true, data });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
};
```

## Support

For issues with the Gemini API integration:
1. Check the [Google AI Studio documentation](https://ai.google.dev/docs)
2. Review the [Gemini API reference](https://ai.google.dev/api/gemini-api)
3. Check your API key permissions in Google AI Studio 
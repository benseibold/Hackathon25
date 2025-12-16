# Gift Suggestion API Setup

This application uses the Anthropic Claude API to fetch real gift suggestions with web search capabilities.

## Setup Instructions

### 1. Get an Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key

### 2. Configure the API Key

Open `src/app/services/chat.ts` and replace `YOUR_API_KEY_HERE` with your actual API key:

```typescript
private readonly ANTHROPIC_API_KEY = 'sk-ant-...'; // Your API key here
```

### 3. How It Works

When users request gift suggestions in the chat:

1. The app sends a search query to Claude API based on recipient demographics (age, gender, interests, budget)
2. Claude searches the web and returns 5 real gift suggestions
3. Each suggestion includes:
   - **Product Image**: Visual preview of the gift
   - **Gift Name**: The product name
   - **Price**: Estimated price within budget
   - **Store Name**: Where to purchase
   - **URL**: Direct link to the product
4. Users can click "+ Add to List" to automatically add the gift with all details

### 4. Important Notes

- **API Costs**: Each suggestion request uses API credits. Monitor your usage at console.anthropic.com
- **Rate Limits**: The API has rate limits. For production use, consider implementing request throttling
- **Security**: Never commit your API key to version control. Consider using environment variables for production
- **Fallback**: If the API fails, the app shows default suggestions with generic store links

### 5. Production Recommendations

For production deployment, you should:

1. **Use a backend proxy**: Don't expose API keys in frontend code
2. **Environment variables**: Store the API key in environment variables
3. **Rate limiting**: Implement rate limiting to prevent API abuse
4. **Caching**: Cache suggestions to reduce API calls
5. **Error handling**: Implement retry logic and better error messages

## Testing

Once configured, test the feature by:

1. Starting the app: `npm start`
2. Adding a recipient with interests (e.g., "legos, sports")
3. Navigating to their gift list
4. Opening the chat window
5. Typing "suggest gifts" or similar message
6. Wait for Claude to search and return 5 gift suggestions
7. Click "+ Add to List" to add a suggested gift

The gift will be added with all 5 fields populated: name, price, store name, URL, and product image.

# Proxy Server Setup

This project includes a proxy server to handle OpenAI API calls and avoid CORS issues.

## Prerequisites

You need to have Node.js and npm installed on your system.

## Installation

1. **Fix permissions** (if you encounter permission errors):
   ```bash
   sudo chown -R $(whoami) /Users/hackathon/.npm
   sudo chown -R $(whoami) /Users/hackathon/Desktop/hackathon/Hackathon25/node_modules
   ```

2. **Install proxy server dependencies**:
   ```bash
   npm install express cors node-fetch@2 --save-dev
   ```

## Configuration

1. **Add your OpenAI API Key** to the environment file:
   - Open `src/environments/environment.ts`
   - Add your OpenAI API key:
     ```typescript
     openaiApiKey: 'your-api-key-here'
     ```

2. **Get your OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy and paste it into the environment file

## Running the Proxy Server

You need to run both the Angular app and the proxy server simultaneously.

### Option 1: Two Terminal Windows

**Terminal 1** - Run the Angular app:
```bash
npm start
```

**Terminal 2** - Run the proxy server:
```bash
npm run proxy
```

### Option 2: Using a Process Manager (Recommended)

Install `concurrently` to run both servers at once:
```bash
npm install concurrently --save-dev
```

Then add this script to `package.json`:
```json
"dev": "concurrently \"npm start\" \"npm run proxy\""
```

Now you can run both with:
```bash
npm run dev
```

## How It Works

1. The Angular app runs on `http://localhost:4200`
2. The proxy server runs on `http://localhost:3000`
3. When the app needs gift suggestions:
   - It sends a request to `http://localhost:3000/api/gift-suggestions`
   - The proxy server forwards the request to OpenAI's API
   - The proxy server returns the response to the Angular app

This avoids CORS issues since the browser makes requests to the same domain (localhost).

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it in `proxy-server.js`:
```javascript
const PORT = 3001; // Change to any available port
```

And update the API_URL in `src/app/services/chat.ts`:
```typescript
private readonly API_URL = 'http://localhost:3001/api/gift-suggestions';
```

### API Key Issues

- Make sure your OpenAI API key is valid
- Check that you have credits available in your OpenAI account
- Verify the key is correctly set in `src/environments/environment.ts`

### Network Errors

If you see network errors:
1. Make sure the proxy server is running
2. Check the browser console for error messages
3. Check the proxy server terminal for error messages
4. Verify your internet connection

## Using a Different Model

The code currently uses `gpt-5.2`. If this model is not available in your OpenAI account, change it in `src/app/services/chat.ts`:

```typescript
body: JSON.stringify({
  model: 'gpt-4', // or 'gpt-3.5-turbo' for cheaper option
  messages: [
    // ...
  ],
  temperature: 0.7
})
```

## Environment Files

Don't forget to update both environment files if needed:
- `src/environments/environment.ts` (production)
- `src/environments/environment.development.ts` (development)

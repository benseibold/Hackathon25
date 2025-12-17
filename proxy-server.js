const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// OpenAI API proxy endpoint
app.post('/api/gift-suggestions', async (req, res) => {
  try {
    const { model, messages, temperature } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    console.log('Proxying request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        messages,
        temperature: temperature || 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('Successfully received response from OpenAI');
    res.json(data);
  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// URL validation endpoint
app.post('/api/validate-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }

    console.log(`Validating URL: ${url}`);

    // Make HEAD request to check if URL exists
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeoutId);

    const isValid = response.ok; // Returns true for 2xx status codes
    console.log(`URL validation result: ${isValid} (status: ${response.status})`);

    res.json({
      valid: isValid,
      status: response.status
    });
  } catch (error) {
    console.error(`URL validation failed: ${error.message}`);
    res.json({
      valid: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Gift suggestions endpoint: http://localhost:${PORT}/api/gift-suggestions`);
  console.log(`URL validation endpoint: http://localhost:${PORT}/api/validate-url`);
});

import { Injectable } from '@angular/core';
import { Recipient } from './budget';
import { environment } from '../../environments/environment';

export interface GiftSuggestion {
  name: string;
  estimatedPrice: number;
  storeName?: string;
  url?: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  suggestions?: GiftSuggestion[];
}

@Injectable({
  providedIn: 'root',
})
export class Chat {
  private readonly OPENAI_API_KEY = environment.openaiApiKey;
  // Using local proxy server to avoid CORS issues
  // Make sure to run: npm run proxy
  private readonly API_URL = 'http://localhost:3000/api/gift-suggestions';

  async generateGiftSuggestions(recipient: Recipient, userMessage?: string): Promise<ChatMessage> {
    let responseText = '';
    const age = recipient.age || 0;
    const gender = recipient.gender || '';
    const interests = recipient.interests || '';
    const budget = recipient.budget;

    // Build search query based on recipient info
    let searchQuery = `Christmas gift ideas`;
    if (interests) {
      searchQuery += ` for someone who likes ${interests}`;
    }
    if (age > 0) {
      searchQuery += ` age ${age}`;
    }
    if (gender) {
      searchQuery += ` ${gender}`;
    }
    searchQuery += ` under $${budget}`;

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-5.2',
          messages: [
            {
              role: 'system',
              content: 'you are a helpful assistant that returns exact valid json with no extra text unless part of the json'
            },
            {
              role: 'user',
              content: userMessage
                ? `a user entered the following message into a chat box - ${userMessage} now with the users message give me 10 gift suggestions under $${budget} that actually exist online (dont limit to amazon) in json under the budget. with this structure [{"name":"Product","estimatedPrice":29.99,"storeName":"RetailerName","url":"https://retailer.com/product","imageUrl":"https://retailer.com/image.jpg"}]`
                : `give me 10 gift suggestions under $${budget} that actually exist online (dont limit to amazon) in json under the budget. with this structure [{"name":"Product","estimatedPrice":29.99,"storeName":"RetailerName","url":"https://retailer.com/product","imageUrl":"https://retailer.com/image.jpg"}]`
            }
          ],
          temperature: 0.7,
          //max_tokens: 1000  // Limit tokens for faster response
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content.trim();

      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Parse the JSON response
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse JSON:', content);
        throw new Error('Invalid JSON response from API');
      }

      // Handle if response is wrapped in an object
      const suggestions: GiftSuggestion[] = Array.isArray(parsedContent)
        ? parsedContent
        : (parsedContent.suggestions || parsedContent.gifts || parsedContent.products || []);

      // Filter to only include products that are actually available (have valid URL and price)
      const availableProducts = suggestions.filter(product =>
        product.name &&
        product.estimatedPrice > 0 &&
        product.url &&
        product.url.startsWith('http') &&
        product.storeName
      );

      // Limit to first 10 available products
      const finalSuggestions = availableProducts.slice(0, 10);

      responseText = `I found these gift suggestions for ${recipient.name}:`;

      return {
        id: Date.now().toString(),
        type: 'bot',
        text: responseText,
        timestamp: new Date(),
        suggestions: finalSuggestions
      };

    } catch (error) {
      console.error('Error fetching gift suggestions:', error);

      // Fallback to mock data if API fails
      const fallbackSuggestions: GiftSuggestion[] = [
        {
          name: 'Gift Card',
          estimatedPrice: Math.min(budget * 0.3, 50),
          storeName: 'Amazon',
          url: 'https://amazon.com',
          imageUrl: 'https://via.placeholder.com/150?text=Gift+Card'
        },
        {
          name: 'Cozy Blanket',
          estimatedPrice: Math.min(budget * 0.25, 40),
          storeName: 'Target',
          url: 'https://target.com',
          imageUrl: 'https://via.placeholder.com/150?text=Blanket'
        },
        {
          name: 'Board Game',
          estimatedPrice: Math.min(budget * 0.3, 45),
          storeName: 'Walmart',
          url: 'https://walmart.com',
          imageUrl: 'https://via.placeholder.com/150?text=Board+Game'
        }
      ];

      return {
        id: Date.now().toString(),
        type: 'bot',
        text: 'Here are some gift suggestions (API unavailable, showing defaults):',
        timestamp: new Date(),
        suggestions: fallbackSuggestions
      };
    }
  }

  getWelcomeMessage(recipient: Recipient): ChatMessage {
    return {
      id: Date.now().toString(),
      type: 'bot',
      text: `Hi! I'm your gift suggestion assistant. I can help you find the perfect gifts for ${recipient.name}. Just ask me for suggestions!`,
      timestamp: new Date()
    };
  }
}

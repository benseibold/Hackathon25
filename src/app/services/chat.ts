import { Injectable } from '@angular/core';
import { Recipient } from './budget';

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
  private readonly ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your API key
  private readonly API_URL = 'https://api.anthropic.com/v1/messages';

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
          'x-api-key': this.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `Search the web for "${searchQuery}" and provide exactly 5 specific gift product suggestions with real prices, store names, URLs, and product image URLs. Format your response as a JSON array with this structure:
[
  {
    "name": "Product name",
    "estimatedPrice": price_as_number,
    "storeName": "Store name",
    "url": "Product URL",
    "imageUrl": "Product image URL"
  }
]

Make sure to find real products that are currently available for purchase online with actual product images. Only respond with the JSON array, nothing else.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Parse the JSON response
      const suggestions: GiftSuggestion[] = JSON.parse(content);

      // Limit to 5 suggestions
      const finalSuggestions = suggestions.slice(0, 5);

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

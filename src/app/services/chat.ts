import { Injectable } from '@angular/core';
import { Recipient } from './budget';

export interface GiftSuggestion {
  name: string;
  estimatedPrice: number;
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

  generateGiftSuggestions(recipient: Recipient, userMessage?: string): ChatMessage {
    const suggestions: GiftSuggestion[] = [];
    let responseText = '';

    // Generate suggestions based on recipient demographics
    const age = recipient.age || 0;
    const gender = recipient.gender?.toLowerCase() || '';
    const interests = recipient.interests?.toLowerCase() || '';
    const budget = recipient.budget;

    // Check for specific interests first
    if (interests.includes('lego')) {
      suggestions.push({ name: 'LEGO Set', estimatedPrice: Math.min(budget * 0.3, 50) });
    }
    if (interests.includes('sport') || interests.includes('soccer') || interests.includes('basketball')) {
      suggestions.push({ name: 'Sports Equipment', estimatedPrice: Math.min(budget * 0.25, 40) });
    }
    if (interests.includes('read') || interests.includes('book')) {
      suggestions.push({ name: 'Book Collection', estimatedPrice: Math.min(budget * 0.2, 30) });
    }
    if (interests.includes('art') || interests.includes('draw') || interests.includes('paint')) {
      suggestions.push({ name: 'Art Supply Set', estimatedPrice: Math.min(budget * 0.3, 45) });
    }
    if (interests.includes('music') || interests.includes('guitar') || interests.includes('piano')) {
      suggestions.push({ name: 'Musical Instrument Accessory', estimatedPrice: Math.min(budget * 0.35, 60) });
    }
    if (interests.includes('video game') || interests.includes('gaming')) {
      suggestions.push({ name: 'Video Game', estimatedPrice: Math.min(budget * 0.4, 60) });
    }
    if (interests.includes('horse')) {
      suggestions.push({ name: 'Horse Riding Gear', estimatedPrice: Math.min(budget * 0.4, 70) });
    }

    // Age-based suggestions
    if (age > 0) {
      if (age >= 3 && age <= 7) {
        if (suggestions.length < 3) {
          suggestions.push({ name: 'Educational Toy', estimatedPrice: Math.min(budget * 0.25, 35) });
          suggestions.push({ name: 'Plush Toy', estimatedPrice: Math.min(budget * 0.15, 20) });
        }
      } else if (age >= 8 && age <= 12) {
        if (suggestions.length < 3) {
          suggestions.push({ name: 'Board Game', estimatedPrice: Math.min(budget * 0.3, 40) });
          suggestions.push({ name: 'Science Kit', estimatedPrice: Math.min(budget * 0.35, 50) });
        }
      } else if (age >= 13 && age <= 17) {
        if (suggestions.length < 3) {
          suggestions.push({ name: 'Headphones', estimatedPrice: Math.min(budget * 0.4, 80) });
          suggestions.push({ name: 'Gift Card', estimatedPrice: Math.min(budget * 0.3, 50) });
        }
      } else if (age >= 18) {
        if (suggestions.length < 3) {
          suggestions.push({ name: 'Gift Card', estimatedPrice: Math.min(budget * 0.3, 50) });
          suggestions.push({ name: 'Experience Voucher', estimatedPrice: Math.min(budget * 0.5, 100) });
        }
      }
    }

    // Gender-based suggestions (if no interests provided)
    if (suggestions.length < 3 && gender) {
      if (gender === 'male') {
        suggestions.push({ name: 'Tool Set', estimatedPrice: Math.min(budget * 0.4, 60) });
      } else if (gender === 'female') {
        suggestions.push({ name: 'Jewelry', estimatedPrice: Math.min(budget * 0.4, 60) });
      }
    }

    // Default suggestions if nothing else matched
    if (suggestions.length === 0) {
      suggestions.push({ name: 'Gift Card', estimatedPrice: Math.min(budget * 0.3, 50) });
      suggestions.push({ name: 'Cozy Blanket', estimatedPrice: Math.min(budget * 0.25, 40) });
      suggestions.push({ name: 'Gourmet Chocolate Box', estimatedPrice: Math.min(budget * 0.15, 25) });
    }

    // Limit to 3 suggestions
    const finalSuggestions = suggestions.slice(0, 3);

    // Generate response text
    if (interests) {
      responseText = `Based on ${recipient.name}'s interest in ${interests}, here are some gift ideas:`;
    } else if (age > 0) {
      responseText = `Here are some gift suggestions for ${recipient.name} (age ${age}):`;
    } else {
      responseText = `Here are some gift suggestions for ${recipient.name}:`;
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      text: responseText,
      timestamp: new Date(),
      suggestions: finalSuggestions
    };
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

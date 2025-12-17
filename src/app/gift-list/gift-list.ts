import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Budget, Recipient, Gift } from '../services/budget';
import { Chat, ChatMessage, GiftSuggestion } from '../services/chat';

@Component({
  selector: 'app-gift-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './gift-list.html',
  styleUrl: './gift-list.css',
})
export class GiftList implements OnInit {
  recipientId: string | null = null;
  recipient: Recipient | undefined;

  // Modal state
  showModal = false;
  isEditMode = false;
  editingGiftId: string | null = null;
  giftName = '';
  giftPrice: number | null = null;
  storeName = '';
  url = '';
  imageUrl = '';

  // Chat functionality
  chatMessages: ChatMessage[] = [];
  userInput = '';
  showChat = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public budgetService: Budget,
    private chatService: Chat,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.recipientId = this.route.snapshot.paramMap.get('id');

    if (this.recipientId) {
      this.recipient = this.budgetService.getRecipientById(this.recipientId);

      if (!this.recipient) {
        // Recipient not found, redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    } else {
      // No recipient ID, redirect to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  openModal() {
    this.isEditMode = false;
    this.editingGiftId = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editingGiftId = null;
    // Clear form
    this.giftName = '';
    this.giftPrice = null;
    this.storeName = '';
    this.url = '';
    this.imageUrl = '';
  }

  editGift(gift: Gift) {
    this.isEditMode = true;
    this.editingGiftId = gift.id;
    this.giftName = gift.name;
    this.giftPrice = gift.price;
    this.storeName = gift.storeName || '';
    this.url = gift.url || '';
    this.imageUrl = gift.imageUrl || '';
    this.showModal = true;
  }

  async addGift(event: Event) {
    event.preventDefault();

    if (this.giftName && this.giftPrice !== null && this.giftPrice > 0 && this.recipientId) {
      if (this.isEditMode && this.editingGiftId) {
        // Update existing gift
        await this.budgetService.updateGift(this.recipientId, this.editingGiftId, {
          name: this.giftName,
          price: this.giftPrice,
          storeName: this.storeName || undefined,
          url: this.url || undefined,
          imageUrl: this.imageUrl || undefined
        });
      } else {
        // Add new gift
        const newGift: Gift = {
          id: Date.now().toString(),
          name: this.giftName,
          price: this.giftPrice,
          recipientId: this.recipientId,
          storeName: this.storeName || undefined,
          url: this.url || undefined,
          imageUrl: this.imageUrl || undefined
        };

        await this.budgetService.addGift(this.recipientId, newGift);
      }

      // Refresh recipient data
      this.recipient = this.budgetService.getRecipientById(this.recipientId);

      // Close modal and clear form
      this.closeModal();
      this.cdr.detectChanges(); // Force UI update to close modal
    } else {
      alert('Please enter a valid gift name and price.');
    }
  }

  async deleteGift(giftId: string) {
    if (this.recipientId) {
      await this.budgetService.deleteGift(this.recipientId, giftId);

      // Refresh recipient data
      this.recipient = this.budgetService.getRecipientById(this.recipientId);
    }
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  getRemainingBudget(): number {
    if (this.recipient) {
      return this.recipient.budget - this.recipient.spent;
    }
    return 0;
  }

  getBudgetPercentage(): number {
    if (this.recipient && this.recipient.budget > 0) {
      return (this.recipient.spent / this.recipient.budget) * 100;
    }
    return 0;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async toggleChat() {
    this.showChat = !this.showChat;
    if (this.showChat && this.chatMessages.length === 0 && this.recipient) {
      // Add welcome message
      this.chatMessages.push(this.chatService.getWelcomeMessage(this.recipient));

      // Automatically generate initial gift suggestions based on recipient info
      const loadingMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'Let me find some perfect gift suggestions for you...',
        timestamp: new Date()
      };
      this.chatMessages.push(loadingMessage);
      this.cdr.detectChanges(); // Force UI update to show loading message

      try {
        // Generate suggestions using the searchQuery (no userMessage)
        const botResponse = await this.chatService.generateGiftSuggestions(this.recipient);
        // Replace loading message with actual response
        const loadingIndex = this.chatMessages.findIndex(m => m.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          this.chatMessages[loadingIndex] = botResponse;
        }
        this.cdr.detectChanges(); // Force UI update to show suggestions
      } catch (error) {
        console.error('Error getting initial suggestions:', error);
        // Replace loading message with error
        const loadingIndex = this.chatMessages.findIndex(m => m.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          this.chatMessages[loadingIndex] = {
            id: loadingMessage.id,
            type: 'bot',
            text: 'Sorry, I encountered an error while searching for gifts. Please try sending me a message to get suggestions.',
            timestamp: new Date()
          };
        }
        this.cdr.detectChanges(); // Force UI update to show error
      }
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || !this.recipient) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: this.userInput,
      timestamp: new Date()
    };
    this.chatMessages.push(userMessage);

    // Clear input
    const message = this.userInput;
    this.userInput = '';

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      text: 'Searching for gift suggestions...',
      timestamp: new Date()
    };
    this.chatMessages.push(loadingMessage);
    this.cdr.detectChanges(); // Force UI update to show loading message

    // Generate bot response
    try {
      if (this.recipient) {
        const botResponse = await this.chatService.generateGiftSuggestions(this.recipient, message);
        // Replace loading message with actual response
        const loadingIndex = this.chatMessages.findIndex(m => m.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          this.chatMessages[loadingIndex] = botResponse;
        }
        this.cdr.detectChanges(); // Force UI update to show suggestions
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      // Replace loading message with error
      const loadingIndex = this.chatMessages.findIndex(m => m.id === loadingMessage.id);
      if (loadingIndex !== -1) {
        this.chatMessages[loadingIndex] = {
          id: loadingMessage.id,
          type: 'bot',
          text: 'Sorry, I encountered an error while searching for gifts. Please try again.',
          timestamp: new Date()
        };
      }
      this.cdr.detectChanges(); // Force UI update to show error
    }
  }

  async addSuggestedGift(suggestion: GiftSuggestion) {
    if (!this.recipientId) return;

    const newGift: Gift = {
      id: Date.now().toString(),
      name: suggestion.name,
      price: suggestion.estimatedPrice,
      recipientId: this.recipientId,
      storeName: suggestion.storeName,
      url: suggestion.url,
      imageUrl: suggestion.imageUrl
    };

    await this.budgetService.addGift(this.recipientId, newGift);

    // Refresh recipient data
    this.recipient = this.budgetService.getRecipientById(this.recipientId);

    // Add confirmation message
    const confirmationMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      text: `Great! I've added "${suggestion.name}" to ${this.recipient?.name}'s gift list.`,
      timestamp: new Date()
    };
    this.chatMessages.push(confirmationMessage);
  }
}

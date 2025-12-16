import { Component, OnInit } from '@angular/core';
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

  // Chat functionality
  chatMessages: ChatMessage[] = [];
  userInput = '';
  showChat = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public budgetService: Budget,
    private chatService: Chat
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
  }

  editGift(gift: Gift) {
    this.isEditMode = true;
    this.editingGiftId = gift.id;
    this.giftName = gift.name;
    this.giftPrice = gift.price;
    this.storeName = gift.storeName || '';
    this.url = gift.url || '';
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
          url: this.url || undefined
        });
      } else {
        // Add new gift
        const newGift: Gift = {
          id: Date.now().toString(),
          name: this.giftName,
          price: this.giftPrice,
          recipientId: this.recipientId,
          storeName: this.storeName || undefined,
          url: this.url || undefined
        };

        await this.budgetService.addGift(this.recipientId, newGift);
      }

      // Refresh recipient data
      this.recipient = this.budgetService.getRecipientById(this.recipientId);

      // Close modal and clear form
      this.closeModal();
    } else {
      alert('Please enter a valid gift name and price.');
    }
  }

  async deleteGift(giftId: string) {
    if (this.recipientId && confirm('Are you sure you want to delete this gift?')) {
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

  toggleChat() {
    this.showChat = !this.showChat;
    if (this.showChat && this.chatMessages.length === 0 && this.recipient) {
      // Add welcome message
      this.chatMessages.push(this.chatService.getWelcomeMessage(this.recipient));
    }
  }

  sendMessage() {
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

    // Generate bot response
    setTimeout(() => {
      if (this.recipient) {
        const botResponse = this.chatService.generateGiftSuggestions(this.recipient, message);
        this.chatMessages.push(botResponse);
      }
    }, 500);
  }

  async addSuggestedGift(suggestion: GiftSuggestion) {
    if (!this.recipientId) return;

    const newGift: Gift = {
      id: Date.now().toString(),
      name: suggestion.name,
      price: suggestion.estimatedPrice,
      recipientId: this.recipientId
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

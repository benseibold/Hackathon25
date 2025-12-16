import { Injectable, signal, computed } from '@angular/core';

export interface Gift {
  id: string;
  name: string;
  price: number;
  recipientId: string;
  storeName?: string;
  url?: string;
  imageUrl?: string;
}

export interface Recipient {
  id: string;
  name: string;
  budget: number;
  spent: number;
  gifts: Gift[];
  age?: number;
  gender?: string;
  interests?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Budget {
  firstName = signal<string>('');
  totalBudget = signal<number>(0);
  recipients = signal<Recipient[]>([]);

  totalSpent = computed(() => {
    return this.recipients().reduce((sum, recipient) => sum + recipient.spent, 0);
  });

  budgetRemaining = computed(() => {
    return this.totalBudget() - this.totalSpent();
  });

  budgetPercentageUsed = computed(() => {
    const total = this.totalBudget();
    if (total === 0) return 0;
    return (this.totalSpent() / total) * 100;
  });

  setUserData(firstName: string, budget: number) {
    this.firstName.set(firstName);
    this.totalBudget.set(budget);
  }

  addRecipient(recipient: Recipient) {
    this.recipients.update(recipients => [...recipients, recipient]);
  }

  updateRecipient(id: string, updates: Partial<Recipient>) {
    this.recipients.update(recipients =>
      recipients.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }

  deleteRecipient(id: string) {
    this.recipients.update(recipients => recipients.filter(r => r.id !== id));
  }

  addGift(recipientId: string, gift: Gift) {
    this.recipients.update(recipients =>
      recipients.map(r => {
        if (r.id === recipientId) {
          const updatedGifts = [...r.gifts, gift];
          const totalSpent = updatedGifts.reduce((sum, g) => sum + g.price, 0);
          return { ...r, gifts: updatedGifts, spent: totalSpent };
        }
        return r;
      })
    );
  }

  updateGift(recipientId: string, giftId: string, updates: Partial<Gift>) {
    this.recipients.update(recipients =>
      recipients.map(r => {
        if (r.id === recipientId) {
          const updatedGifts = r.gifts.map(g => g.id === giftId ? { ...g, ...updates } : g);
          const totalSpent = updatedGifts.reduce((sum, g) => sum + g.price, 0);
          return { ...r, gifts: updatedGifts, spent: totalSpent };
        }
        return r;
      })
    );
  }

  deleteGift(recipientId: string, giftId: string) {
    this.recipients.update(recipients =>
      recipients.map(r => {
        if (r.id === recipientId) {
          const updatedGifts = r.gifts.filter(g => g.id !== giftId);
          const totalSpent = updatedGifts.reduce((sum, g) => sum + g.price, 0);
          return { ...r, gifts: updatedGifts, spent: totalSpent };
        }
        return r;
      })
    );
  }

  getRecipientById(id: string): Recipient | undefined {
    return this.recipients().find(r => r.id === id);
  }
}

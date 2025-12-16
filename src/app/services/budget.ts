import { Injectable, signal, computed, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';

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
  private firebaseService = inject(FirebaseService);

  userId = signal<string>('');
  firstName = signal<string>('');
  totalBudget = signal<number>(0);
  recipients = signal<Recipient[]>([]);

  constructor() {
    // Listen for auth state changes
    this.firebaseService.onAuthStateChanged(async (user) => {
      if (user) {
        this.userId.set(user.uid);
        // Load user data from Firestore
        await this.loadUserData(user.uid);
      } else {
        this.userId.set('');
        this.firstName.set('');
        this.totalBudget.set(0);
        this.recipients.set([]);
      }
    });
  }

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

  async loadUserData(userId: string) {
    const userData = await this.firebaseService.getUserData(userId);
    if (userData) {
      this.firstName.set(userData.firstName);
      this.totalBudget.set(userData.totalBudget);
    }

    const recipients = await this.firebaseService.getRecipients(userId);
    this.recipients.set(recipients);
  }

  async setUserData(firstName: string, budget: number) {
    this.firstName.set(firstName);
    this.totalBudget.set(budget);

    // Save to Firebase using authenticated user's UID
    const uid = this.userId();
    if (uid) {
      await this.firebaseService.saveUserData(uid, firstName, budget);
    }
  }

  async addRecipient(recipient: Recipient) {
    this.recipients.update(recipients => [...recipients, recipient]);

    // Save to Firebase if userId exists
    const uid = this.userId();
    if (uid) {
      await this.firebaseService.addRecipient(uid, recipient);
    }
  }

  async updateRecipient(id: string, updates: Partial<Recipient>) {
    this.recipients.update(recipients =>
      recipients.map(r => r.id === id ? { ...r, ...updates } : r)
    );

    // Update in Firebase if userId exists
    const uid = this.userId();
    if (uid) {
      await this.firebaseService.updateRecipient(uid, id, updates);
    }
  }

  deleteRecipient(id: string) {
    this.recipients.update(recipients => recipients.filter(r => r.id !== id));
  }

  async addGift(recipientId: string, gift: Gift) {
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

    // Save to Firebase if userId exists
    const uid = this.userId();
    if (uid) {
      await this.firebaseService.addGift(uid, recipientId, gift);
    }
  }

  async updateGift(recipientId: string, giftId: string, updates: Partial<Gift>) {
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

    // Update in Firebase if userId exists
    const uid = this.userId();
    if (uid) {
      await this.firebaseService.updateGift(uid, recipientId, giftId, updates);
    }
  }

  async deleteGift(recipientId: string, giftId: string) {
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

    // Delete from Firebase if userId exists
    const uid = this.userId();
    if (uid) {
      await this.firebaseService.deleteGift(uid, recipientId, giftId);
    }
  }

  getRecipientById(id: string): Recipient | undefined {
    return this.recipients().find(r => r.id === id);
  }
}

import { Injectable, signal, computed } from '@angular/core';

export interface Recipient {
  id: string;
  name: string;
  budget: number;
  spent: number;
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
}

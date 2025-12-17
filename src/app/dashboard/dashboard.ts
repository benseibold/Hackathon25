import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Budget } from '../services/budget';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  daysUntilChristmas = signal<number>(0);
  hoursUntilChristmas = signal<number>(0);
  minutesUntilChristmas = signal<number>(0);
  secondsUntilChristmas = signal<number>(0);
  private countdownInterval?: number;

  constructor(
    public budgetService: Budget,
    private router: Router
  ) {}

  ngOnInit() {
    this.calculateDaysUntilChristmas();
    // Update countdown every second
    this.countdownInterval = window.setInterval(() => {
      this.calculateDaysUntilChristmas();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  calculateDaysUntilChristmas() {
    const today = new Date();
    const currentYear = today.getFullYear();
    let christmas = new Date(currentYear, 11, 25); // December 25

    // If Christmas has passed this year, calculate for next year
    if (today > christmas) {
      christmas = new Date(currentYear + 1, 11, 25);
    }

    const timeDiff = christmas.getTime() - today.getTime();

    const days = Math.floor(timeDiff / (1000 * 3600 * 24));
    const hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
    const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    this.daysUntilChristmas.set(days);
    this.hoursUntilChristmas.set(hours);
    this.minutesUntilChristmas.set(minutes);
    this.secondsUntilChristmas.set(seconds);
  }

  addRecipient() {
    this.router.navigate(['/recipient-profile']);
  }

  editRecipient(id: string) {
    this.router.navigate(['/recipient-profile', id]);
  }

  deleteRecipient(id: string) {
    const recipient = this.budgetService.recipients().find(r => r.id === id);
    if (recipient && confirm(`Are you sure you want to delete ${recipient.name}?`)) {
      this.budgetService.deleteRecipient(id);
    }
  }

  viewGiftList(id: string) {
    this.router.navigate(['/gift-list', id]);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Total budget calculations
  getTotalPurchased(): number {
    return this.budgetService.recipients().reduce((sum, recipient) => {
      return sum + recipient.gifts.filter(g => g.purchased).reduce((gSum, g) => gSum + g.price, 0);
    }, 0);
  }

  getTotalUnpurchased(): number {
    return this.budgetService.recipients().reduce((sum, recipient) => {
      return sum + recipient.gifts.filter(g => !g.purchased).reduce((gSum, g) => gSum + g.price, 0);
    }, 0);
  }

  getTotalPurchasedPercentage(): number {
    const totalBudget = this.budgetService.totalBudget();
    if (totalBudget > 0) {
      return (this.getTotalPurchased() / totalBudget) * 100;
    }
    return 0;
  }

  getTotalUnpurchasedPercentage(): number {
    const totalBudget = this.budgetService.totalBudget();
    if (totalBudget > 0) {
      return (this.getTotalUnpurchased() / totalBudget) * 100;
    }
    return 0;
  }

  // Per-recipient calculations
  getRecipientPurchased(recipientId: string): number {
    const recipient = this.budgetService.recipients().find(r => r.id === recipientId);
    if (recipient) {
      return recipient.gifts.filter(g => g.purchased).reduce((sum, g) => sum + g.price, 0);
    }
    return 0;
  }

  getRecipientUnpurchased(recipientId: string): number {
    const recipient = this.budgetService.recipients().find(r => r.id === recipientId);
    if (recipient) {
      return recipient.gifts.filter(g => !g.purchased).reduce((sum, g) => sum + g.price, 0);
    }
    return 0;
  }

  getRecipientPurchasedPercentage(recipientId: string, recipientBudget: number): number {
    if (recipientBudget > 0) {
      return (this.getRecipientPurchased(recipientId) / recipientBudget) * 100;
    }
    return 0;
  }

  getRecipientUnpurchasedPercentage(recipientId: string, recipientBudget: number): number {
    if (recipientBudget > 0) {
      return (this.getRecipientUnpurchased(recipientId) / recipientBudget) * 100;
    }
    return 0;
  }
}

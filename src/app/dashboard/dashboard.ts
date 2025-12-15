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

  constructor(
    public budgetService: Budget,
    private router: Router
  ) {}

  ngOnInit() {
    this.calculateDaysUntilChristmas();

    // Redirect to budget input if no user data
    if (!this.budgetService.firstName()) {
      this.router.navigate(['/budget-input']);
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
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    this.daysUntilChristmas.set(daysDiff);
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
}

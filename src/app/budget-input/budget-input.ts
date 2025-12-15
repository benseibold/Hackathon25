import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Budget } from '../services/budget';

@Component({
  selector: 'app-budget-input',
  imports: [FormsModule],
  templateUrl: './budget-input.html',
  styleUrl: './budget-input.css',
})
export class BudgetInput {
  firstName = '';
  budget = 0;

  snowflakes = Array(15).fill(0);
  lights = Array(12).fill(0).map((_, i) => ({
    delay: `${i * 0.2}s`
  }));

  constructor(
    private router: Router,
    private budgetService: Budget
  ) {}

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.firstName && this.budget > 0) {
      this.budgetService.setUserData(this.firstName, this.budget);
      this.router.navigate(['/dashboard']);
    } else {
      alert('Please fill in all fields with valid values.');
    }
  }
}

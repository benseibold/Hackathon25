import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Budget } from '../services/budget';

@Component({
  selector: 'app-recipient-profile',
  imports: [FormsModule],
  templateUrl: './recipient-profile.html',
  styleUrl: './recipient-profile.css',
})
export class RecipientProfile implements OnInit {
  name = '';
  age: number | null = null;
  gender = '';
  budget: number | null = null;
  interests = '';

  recipientId: string | null = null;
  isEditMode = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private budgetService: Budget
  ) {}

  ngOnInit() {
    this.recipientId = this.route.snapshot.paramMap.get('id');

    if (this.recipientId) {
      this.isEditMode = true;
      const recipient = this.budgetService.recipients().find(r => r.id === this.recipientId);

      if (recipient) {
        this.name = recipient.name;
        this.budget = recipient.budget;
        // Note: age, gender, and interests are not stored in the current Recipient interface
        // They would need to be added to the interface to support editing these fields
      } else {
        // Recipient not found, redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.name && this.budget !== null && this.budget > 0) {
      if (this.isEditMode && this.recipientId) {
        // Update existing recipient
        this.budgetService.updateRecipient(this.recipientId, {
          name: this.name,
          budget: this.budget
        });
      } else {
        // Add new recipient
        const newRecipient = {
          id: Date.now().toString(),
          name: this.name,
          budget: this.budget,
          spent: 0
        };
        this.budgetService.addRecipient(newRecipient);
      }

      this.router.navigate(['/dashboard']);
    } else {
      alert('Please fill in all required fields (Name and Budget).');
    }
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}

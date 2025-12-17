import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { User } from '@angular/fire/auth';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-sign-in',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  firstName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  budget = signal<number>(0);
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  async signInWithEmail() {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');
      const user = await this.firebaseService.signInWithEmail(this.email(), this.password());
      await this.checkUserProfileAndRoute(user);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign in');
    } finally {
      this.isLoading.set(false);
    }
  }

  async signUpWithEmail() {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');

      // Validate inputs
      if (!this.firstName().trim()) {
        this.errorMessage.set('Please enter your first name');
        this.isLoading.set(false);
        return;
      }

      if (!this.password().trim()) {
        this.errorMessage.set('Please enter a password');
        this.isLoading.set(false);
        return;
      }

      if (this.password() !== this.confirmPassword()) {
        this.errorMessage.set('Passwords do not match');
        this.isLoading.set(false);
        return;
      }

      if (this.budget() <= 0) {
        this.errorMessage.set('Please enter a valid budget amount');
        this.isLoading.set(false);
        return;
      }

      const user = await this.firebaseService.signUpWithEmail(this.email(), this.password());

      // Save user data (name and budget) to Firestore
      await this.firebaseService.saveUserData(user.uid, this.firstName(), this.budget());

      // Route to dashboard since profile is now created
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign up');
    } finally {
      this.isLoading.set(false);
    }
  }

  async forgotPassword() {
    try {
      this.errorMessage.set('');
      this.successMessage.set('');

      if (!this.email().trim()) {
        this.errorMessage.set('Please enter your email address');
        return;
      }

      await this.firebaseService.resetPassword(this.email());
      this.successMessage.set('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to send password reset email');
    }
  }

  private async checkUserProfileAndRoute(user: User) {

    const userData = await this.firebaseService.getUserData(user.uid);
    if (userData) {
      // User has existing profile, route to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // New user, route to budget-input to create profile
      this.router.navigate(['/budget-input']);
    }
  }
}

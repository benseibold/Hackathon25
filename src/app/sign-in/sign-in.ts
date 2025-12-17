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

  email = signal('');
  password = signal('');
  errorMessage = signal('');
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
      const user = await this.firebaseService.signUpWithEmail(this.email(), this.password());
      await this.checkUserProfileAndRoute(user);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign up');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async checkUserProfileAndRoute(user: User) {

    const userData = await this.firebaseService.getUserData(user.uid);
    console.log(user);
    console.log(userData);
    if (userData) {
      // User has existing profile, route to dashboard
      console.log('dahsboard');
      this.router.navigate(['/dashboard']);
    } else {
      // New user, route to budget-input to create profile
      console.log('budget');
      this.router.navigate(['/budget-input']);
    }
  }
}

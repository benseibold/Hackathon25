import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = () => {
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);

  const user = firebaseService.getCurrentUser();

  if (user) {
    return true;
  } else {
    router.navigate(['/sign-in']);
    return false;
  }
};

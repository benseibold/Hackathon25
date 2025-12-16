import { Routes } from '@angular/router';
import { SplashScreen } from './splash-screen/splash-screen';
import { SignIn } from './sign-in/sign-in';
import { BudgetInput } from './budget-input/budget-input';
import { Dashboard } from './dashboard/dashboard';
import { RecipientProfile } from './recipient-profile/recipient-profile';
import { GiftList } from './gift-list/gift-list';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: SplashScreen },
  { path: 'sign-in', component: SignIn },
  { path: 'budget-input', component: BudgetInput, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'recipient-profile', component: RecipientProfile, canActivate: [authGuard] },
  { path: 'recipient-profile/:id', component: RecipientProfile, canActivate: [authGuard] },
  { path: 'gift-list/:id', component: GiftList, canActivate: [authGuard] },
];

import { Routes } from '@angular/router';
import { SplashScreen } from './splash-screen/splash-screen';
import { BudgetInput } from './budget-input/budget-input';
import { Dashboard } from './dashboard/dashboard';
import { RecipientProfile } from './recipient-profile/recipient-profile';
import { GiftList } from './gift-list/gift-list';

export const routes: Routes = [
  { path: '', component: SplashScreen },
  { path: 'budget-input', component: BudgetInput },
  { path: 'dashboard', component: Dashboard },
  { path: 'recipient-profile', component: RecipientProfile },
  { path: 'recipient-profile/:id', component: RecipientProfile },
  { path: 'gift-list/:id', component: GiftList },
];

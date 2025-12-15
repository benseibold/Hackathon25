import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  imports: [],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.css',
})
export class SplashScreen {
  snowflakes = Array(20).fill(0);
  lights = Array(15).fill(0).map((_, i) => ({
    delay: `${i * 0.2}s`
  }));

  constructor(private router: Router) {}

  navigateToBudgetInput() {
    this.router.navigate(['/budget-input']);
  }
}

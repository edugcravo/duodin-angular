import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentPage = 'dashboard';
  isMobileSidebarOpen = false;
  coupleNames = { partner1: '…', partner2: '…' };
  isLoggedIn = false;

  onLogout() {
    this.isLoggedIn = false;
  }
}

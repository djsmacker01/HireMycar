import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-debug-container">
      <h2>Authentication Debug</h2>
      
      <div class="debug-section">
        <h3>Auth State</h3>
        <p><strong>Is Authenticated:</strong> {{ authService.isAuthenticated() }}</p>
        <p><strong>Is Loading:</strong> {{ authService.isLoading() }}</p>
        <p><strong>Current User:</strong> {{ currentUser | json }}</p>
        <p><strong>Current Profile:</strong> {{ currentProfile | json }}</p>
      </div>
      
      <div class="debug-section">
        <h3>User Role</h3>
        <p><strong>User Type:</strong> {{ currentProfile?.user_type || 'Not set' }}</p>
        <p><strong>Is Owner:</strong> {{ authService.isOwner() }}</p>
        <p><strong>Is Renter:</strong> {{ authService.isRenter() }}</p>
        <p><strong>Is Admin:</strong> {{ authService.isAdmin() }}</p>
      </div>
      
      <div class="debug-section">
        <h3>Navigation</h3>
        <button (click)="goToDashboard()" class="btn btn-primary">Go to Dashboard</button>
        <button (click)="goToTestDashboard()" class="btn btn-secondary">Go to Test Dashboard</button>
        <button (click)="refreshAuth()" class="btn btn-outline">Refresh Auth</button>
      </div>
    </div>
  `,
  styles: [`
    .auth-debug-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .debug-section {
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      margin: 0.25rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid #007bff;
      color: #007bff;
    }
  `]
})
export class AuthDebugComponent implements OnInit {
  currentUser: any = null;
  currentProfile: any = null;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.loadAuthData();
  }

  loadAuthData(): void {
    this.currentUser = this.authService.currentUser;
    this.currentProfile = this.authService.currentProfile;
    console.log('Auth Debug - Current User:', this.currentUser);
    console.log('Auth Debug - Current Profile:', this.currentProfile);

    // Call the debug method
    this.authService.debugAuthStatus();
  }

  goToDashboard(): void {
    window.location.href = '/dashboard';
  }

  goToTestDashboard(): void {
    window.location.href = '/test-dashboard';
  }

  refreshAuth(): void {
    this.loadAuthData();
  }
}

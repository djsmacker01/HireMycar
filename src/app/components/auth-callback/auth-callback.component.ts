import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-callback-container">
      <div class="auth-callback-content">
        <div class="spinner"></div>
        <h2>Completing sign in...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-callback-content {
      text-align: center;
      background: white;
      padding: 3rem 2rem;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 90%;
    }

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }

    h2 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    p {
      color: #6b7280;
      margin: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // The auth state change listener in AuthService will handle the redirect
    // after the session is established
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }
}

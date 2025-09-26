import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SimpleAuthService } from '../../services/simple-auth.service';
import { LoginData, AuthError } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() switchToSignup = new EventEmitter<void>();

  loginData: LoginData = {
    email: '',
    password: ''
  };

  isLoading = false;
  error: AuthError | null = null;
  showPassword = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private simpleAuth: SimpleAuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Login Modal: Component initialized');
    console.log('Login Modal: SimpleAuth service:', this.simpleAuth);

    // Listen to auth state changes
    this.simpleAuth.authState$.subscribe(authState => {
      console.log('Login: Auth state changed:', authState);
      if (authState.isAuthenticated) {
        console.log('Login: User authenticated, closing modal');
        this.closeModal();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit(): Promise<void> {
    console.log('Login: Starting sign-in process...');
    console.log('Login data:', this.loginData);

    if (!this.isFormValid()) {
      console.log('Login: Form validation failed');
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      console.log('Login: Attempting sign-in with SimpleAuth...');
      const result = await this.simpleAuth.signIn(this.loginData.email, this.loginData.password);

      console.log('Login: Sign-in result:', result);

      if (result.success) {
        console.log('Login: Sign-in successful, checking authentication status...');

        // Wait a moment for auth state to update
        setTimeout(() => {
          console.log('Login: Auth status after sign-in:', this.simpleAuth.isAuthenticated());
          this.simpleAuth.debugAuthStatus();

          // Check for return URL
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
          if (returnUrl) {
            console.log('Login: Redirecting to return URL:', returnUrl);
            this.router.navigateByUrl(returnUrl);
          } else {
            console.log('Login: Redirecting to dashboard');
            this.router.navigate(['/dashboard']);
          }
          this.closeModal();
        }, 1000);
      } else {
        console.error('Login: Sign-in failed:', result.error);
        this.error = { message: result.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login: Sign-in error:', error);
      this.error = { message: error.message || 'An unexpected error occurred' };
    } finally {
      this.isLoading = false;
    }
  }

  async onGoogleSignIn(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.authService.signInWithGoogle();

      if (!result.success) {
        this.error = result.error || { message: 'Google sign-in failed' };
      }
    } catch (error: any) {
      this.error = { message: error.message || 'An unexpected error occurred' };
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSwitchToSignup(): void {
    this.switchToSignup.emit();
  }


  onForgotPassword(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Close the login modal and navigate to password reset
    this.closeModal();
    this.router.navigate(['/reset-password']);
  }

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  isFormValid(): boolean {
    return !!(this.loginData.email && this.loginData.password);
  }

  // Handle escape key
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}

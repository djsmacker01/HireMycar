import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SignupData, AuthError } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-signup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup-modal.component.html',
  styleUrls: ['./signup-modal.component.scss']
})
export class SignupModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  signupData: SignupData = {
    email: '',
    password: '',
    full_name: '',
    user_type: 'renter',
    phone_number: ''
  };

  confirmPassword = '';
  isLoading = false;
  error: AuthError | null = null;
  showPassword = false;
  showConfirmPassword = false;
  acceptedTerms = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Listen for auth state changes to close modal on successful signup
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        if (authState.isAuthenticated && !authState.isLoading) {
          this.closeModal();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.authService.signUp(this.signupData);

      if (result.success) {
        // Check if email verification is required
        const user = this.authService.currentUser();
        if (user && !user.email_confirmed_at) {
          // Redirect to email verification
          this.router.navigate(['/verify-email']);
        } else {
          // Redirect to profile setup for new users
          this.router.navigate(['/profile-setup']);
        }
        this.closeModal();
      } else {
        this.error = result.error || { message: 'Signup failed' };
      }
    } catch (error: any) {
      this.error = { message: error.message || 'An unexpected error occurred' };
    } finally {
      this.isLoading = false;
    }
  }

  async onGoogleSignUp(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.authService.signInWithGoogle();

      if (!result.success) {
        this.error = result.error || { message: 'Google sign-up failed' };
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

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSwitchToLogin(): void {
    this.switchToLogin.emit();
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
    return !!(
      this.signupData.email &&
      this.signupData.password &&
      this.signupData.full_name &&
      this.confirmPassword &&
      this.signupData.password === this.confirmPassword &&
      this.acceptedTerms
    );
  }

  // Handle escape key
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  // Password strength indicator
  getPasswordStrength(): { strength: string; color: string; percentage: number } {
    const password = this.signupData.password;
    if (!password) {
      return { strength: '', color: '', percentage: 0 };
    }

    let score = 0;
    if (password.length >= 8) {
      score += 25;
    }
    if (/[a-z]/.test(password)) {
      score += 25;
    }
    if (/[A-Z]/.test(password)) {
      score += 25;
    }
    if (/[0-9]/.test(password)) {
      score += 25;
    }

    if (score < 50) {
      return { strength: 'Weak', color: '#ef4444', percentage: score };
    }
    if (score < 75) {
      return { strength: 'Medium', color: '#f59e0b', percentage: score };
    }
    return { strength: 'Strong', color: '#10b981', percentage: score };
  }
}

import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    // Listen for auth state changes to close modal on successful login
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
      const result = await this.authService.signIn(this.loginData);
      
      if (result.success) {
        // Check for return URL
        const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['/']);
        }
        this.closeModal();
      } else {
        this.error = result.error || { message: 'Login failed' };
      }
    } catch (error: any) {
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

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private isFormValid(): boolean {
    return !!(this.loginData.email && this.loginData.password);
  }

  // Handle escape key
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}

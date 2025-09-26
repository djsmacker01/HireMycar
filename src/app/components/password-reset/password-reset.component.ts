import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthError } from '../../interfaces/auth.interface';

@Component({
    selector: 'app-password-reset',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './password-reset.component.html',
    styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit, OnDestroy {
    email = '';
    newPassword = '';
    confirmPassword = '';
    isLoading = false;
    error: AuthError | null = null;
    success = false;
    step: 'email' | 'reset' = 'email';
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Check if user is authenticated (coming from reset link)
        if (this.authService.isAuthenticated()) {
            this.step = 'reset';
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async sendResetEmail(): Promise<void> {
        if (!this.email.trim()) {
            this.error = { message: 'Please enter your email address' };
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const result = await this.authService.sendPasswordResetEmail(this.email);

            if (result.success) {
                this.success = true;
            } else {
                this.error = result.error || { message: 'Failed to send password reset email' };
            }
        } catch (error: any) {
            this.error = { message: error.message || 'An unexpected error occurred' };
        } finally {
            this.isLoading = false;
        }
    }

    async resetPassword(): Promise<void> {
        if (!this.isFormValid()) {
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const result = await this.authService.resetPassword(this.newPassword);

            if (result.success) {
                this.success = true;
                // Redirect to dashboard after successful password reset
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 2000);
            } else {
                this.error = result.error || { message: 'Password reset failed' };
            }
        } catch (error: any) {
            this.error = { message: error.message || 'An unexpected error occurred' };
        } finally {
            this.isLoading = false;
        }
    }

    isFormValid(): boolean {
        if (this.step === 'email') {
            return !!this.email.trim();
        } else {
            return !!(
                this.newPassword &&
                this.confirmPassword &&
                this.newPassword === this.confirmPassword &&
                this.newPassword.length >= 8
            );
        }
    }

    getPasswordStrength(): { strength: string; color: string; percentage: number } {
        const password = this.newPassword;
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

    togglePasswordVisibility(inputId: string): void {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
        }
    }

    onBackToLogin(): void {
        this.router.navigate(['/']);
    }
}

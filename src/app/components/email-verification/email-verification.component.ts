import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthError } from '../../interfaces/auth.interface';

@Component({
    selector: 'app-email-verification',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './email-verification.component.html',
    styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
    verificationCode = '';
    isLoading = false;
    error: AuthError | null = null;
    success = false;
    emailSent = false;
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Check if user is authenticated and needs verification
        if (this.authService.isAuthenticated()) {
            const user = this.authService.currentUser();
            if (user && !user.email_confirmed_at) {
                // User is logged in but email not verified
                this.sendVerificationEmail();
            } else {
                // User is already verified, redirect to dashboard
                this.router.navigate(['/']);
            }
        } else {
            // User not authenticated, redirect to login
            this.router.navigate(['/']);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async sendVerificationEmail(): Promise<void> {
        this.isLoading = true;
        this.error = null;

        try {
            const result = await this.authService.sendEmailVerification();

            if (result.success) {
                this.emailSent = true;
                this.success = true;
            } else {
                this.error = result.error || { message: 'Failed to send verification email' };
            }
        } catch (error: any) {
            this.error = { message: error.message || 'An unexpected error occurred' };
        } finally {
            this.isLoading = false;
        }
    }

    async verifyEmail(): Promise<void> {
        if (!this.verificationCode.trim()) {
            this.error = { message: 'Please enter the verification code' };
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const result = await this.authService.verifyEmail(this.verificationCode, 'email');

            if (result.success) {
                this.success = true;
                // Redirect to dashboard after successful verification
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 2000);
            } else {
                this.error = result.error || { message: 'Email verification failed' };
            }
        } catch (error: any) {
            this.error = { message: error.message || 'An unexpected error occurred' };
        } finally {
            this.isLoading = false;
        }
    }

    onResendEmail(): void {
        this.emailSent = false;
        this.success = false;
        this.verificationCode = '';
        this.sendVerificationEmail();
    }

    onBackToLogin(): void {
        this.authService.signOut();
    }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserProfile, AuthError } from '../../interfaces/auth.interface';

@Component({
    selector: 'app-profile-setup',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-setup.component.html',
    styleUrls: ['./profile-setup.component.scss']
})
export class ProfileSetupComponent implements OnInit, OnDestroy {
    profileData: Partial<UserProfile> = {
        full_name: '',
        phone_number: '',
        address: '',
        city: '',
        state: '',
        user_type: 'renter'
    };

    isLoading = false;
    error: AuthError | null = null;
    success = false;
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Check if user is authenticated
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
            return;
        }

        // Pre-fill with existing data if available
        const currentProfile = this.authService.currentProfile();
        if (currentProfile) {
            this.profileData = {
                full_name: currentProfile.full_name || '',
                phone_number: currentProfile.phone_number || '',
                address: currentProfile.address || '',
                city: currentProfile.city || '',
                state: currentProfile.state || '',
                user_type: currentProfile.user_type || 'renter'
            };
        }

        // Pre-fill with user data from auth
        const user = this.authService.currentUser();
        if (user && !this.profileData.full_name) {
            this.profileData.full_name = user.user_metadata?.['full_name'] || user.email?.split('@')[0] || '';
        }
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
            const result = await this.authService.updateProfile(this.profileData);

            if (result.success) {
                this.success = true;
                // Redirect to appropriate dashboard based on user type
                setTimeout(() => {
                    if (this.profileData.user_type === 'owner') {
                        this.router.navigate(['/car-owner-dashboard']);
                    } else {
                        this.router.navigate(['/renter-dashboard']);
                    }
                }, 2000);
            } else {
                this.error = result.error || { message: 'Profile update failed' };
            }
        } catch (error: any) {
            this.error = { message: error.message || 'An unexpected error occurred' };
        } finally {
            this.isLoading = false;
        }
    }

    isFormValid(): boolean {
        return !!(
            this.profileData.full_name?.trim() &&
            this.profileData.phone_number?.trim() &&
            this.profileData.user_type
        );
    }

    onSkip(): void {
        // Redirect to appropriate dashboard
        if (this.profileData.user_type === 'owner') {
            this.router.navigate(['/car-owner-dashboard']);
        } else {
            this.router.navigate(['/renter-dashboard']);
        }
    }

    onBackToLogin(): void {
        this.authService.signOut();
    }
}

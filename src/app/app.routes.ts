import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { CarSearchComponent } from './car-search/car-search.component';
import { CarDetailsComponent } from './car-details/car-details.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';
import { AddCarListingComponent } from './add-car-listing/add-car-listing.component';
import { CarOwnerDashboardComponent } from './car-owner-dashboard/car-owner-dashboard.component';
import { RenterDashboardComponent } from './renter-dashboard/renter-dashboard.component';
import { MessagingComponent } from './messaging/messaging.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AuthGuard } from './guards/auth.guard';
import { BypassAuthGuard } from './guards/bypass-auth.guard';
import { SmartAuthGuard } from './guards/smart-auth.guard';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { ProfileSetupComponent } from './components/profile-setup/profile-setup.component';
import { SupportComponent } from './support/support.component';
import { AuthDebugComponent } from './components/auth-debug/auth-debug.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: LandingComponent },
  { path: 'search', component: CarSearchComponent },
  { path: 'car/:id', component: CarDetailsComponent },
  { path: 'booking-confirmation', component: BookingConfirmationComponent, canActivate: [SmartAuthGuard] },
  { path: 'add-car-listing', component: AddCarListingComponent, canActivate: [SmartAuthGuard] },
  { path: 'dashboard', component: CarOwnerDashboardComponent, canActivate: [SmartAuthGuard] },
  { path: 'test-dashboard', component: CarOwnerDashboardComponent },
  { path: 'auth-debug', component: AuthDebugComponent },
  { path: 'bypass-dashboard', component: CarOwnerDashboardComponent },
  { path: 'renter-dashboard', component: RenterDashboardComponent, canActivate: [SmartAuthGuard] },
  { path: 'messaging', component: MessagingComponent, canActivate: [SmartAuthGuard] },
  { path: 'profile', component: UserProfileComponent, canActivate: [SmartAuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [SmartAuthGuard] },
  { path: 'support', component: SupportComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'verify-email', component: EmailVerificationComponent, canActivate: [SmartAuthGuard] },
  { path: 'reset-password', component: PasswordResetComponent },
  { path: 'profile-setup', component: ProfileSetupComponent, canActivate: [SmartAuthGuard] },
  { path: '**', redirectTo: '' }
];

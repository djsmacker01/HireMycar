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
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { SupportComponent } from './support/support.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: LandingComponent },
  { path: 'search', component: CarSearchComponent },
  { path: 'car/:id', component: CarDetailsComponent },
  { path: 'booking-confirmation', component: BookingConfirmationComponent, canActivate: [AuthGuard] },
  { path: 'add-car-listing', component: AddCarListingComponent },
  { path: 'dashboard', component: CarOwnerDashboardComponent, canActivate: [AuthGuard], data: { role: 'owner' } },
  { path: 'renter-dashboard', component: RenterDashboardComponent, canActivate: [AuthGuard], data: { role: 'renter' } },
  { path: 'messaging', component: MessagingComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'support', component: SupportComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: '**', redirectTo: '' }
];

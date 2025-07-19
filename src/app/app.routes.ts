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

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: LandingComponent },
  { path: 'search', component: CarSearchComponent },
  { path: 'car/:id', component: CarDetailsComponent },
  { path: 'booking-confirmation', component: BookingConfirmationComponent },
  { path: 'add-car-listing', component: AddCarListingComponent },
  { path: 'dashboard', component: CarOwnerDashboardComponent },
  { path: 'renter-dashboard', component: RenterDashboardComponent },
  { path: 'messaging', component: MessagingComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];

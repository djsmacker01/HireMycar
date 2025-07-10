import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { CarSearchComponent } from './car-search/car-search.component';
import { CarDetailsComponent } from './car-details/car-details.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: LandingComponent },
  { path: 'search', component: CarSearchComponent },
  { path: 'car/:id', component: CarDetailsComponent },
  { path: '**', redirectTo: '' }
];

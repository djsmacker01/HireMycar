import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interfaces
export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export interface TrustIndicator {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  features: Feature[] = [
    {
      icon: 'verified_user',
      title: 'Verified Users',
      description: 'All users are thoroughly verified for your safety and peace of mind'
    },
    {
      icon: 'schedule',
      title: 'Flexible Rentals',
      description: 'Rent cars by the hour, day, or week - whatever suits your needs'
    },
    {
      icon: 'security',
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options'
    }
  ];

  renterSteps: HowItWorksStep[] = [
    {
      number: '1',
      title: 'Search & Choose',
      description: 'Browse available cars in your area and select the perfect match',
      icon: 'search'
    },
    {
      number: '2',
      title: 'Book & Pay',
      description: 'Reserve your car with secure payment and instant confirmation',
      icon: 'payment'
    },
    {
      number: '3',
      title: 'Drive & Return',
      description: 'Pick up your car and enjoy your journey, then return it safely',
      icon: 'directions_car'
    }
  ];

  ownerSteps: HowItWorksStep[] = [
    {
      number: '1',
      title: 'List Your Car',
      description: 'Add your car details, photos, and set your rental rates',
      icon: 'add_circle'
    },
    {
      number: '2',
      title: 'Get Bookings',
      description: 'Receive booking requests and manage your calendar',
      icon: 'notifications'
    },
    {
      number: '3',
      title: 'Earn Money',
      description: 'Earn passive income while your car helps others travel',
      icon: 'monetization_on'
    }
  ];

  trustIndicators: TrustIndicator[] = [
    {
      icon: 'shield',
      text: '100% Secure'
    },
    {
      icon: 'support_agent',
      text: '24/7 Support'
    },
    {
      icon: 'star',
      text: '4.8★ Rating'
    },
    {
      icon: 'people',
      text: '10K+ Users'
    }
  ];

  // Icon mapping for better compatibility
  getIconClass(iconName: string): string {
    return `material-icons ${iconName}`;
  }

  onFindCarClick(): void {
    // TODO: Navigate to car search page
    console.log('Find Car clicked');
  }

  onListCarClick(): void {
    // TODO: Navigate to car listing page
    console.log('List Car clicked');
  }
} 
# HireMyCar.com.ng - MVP System Requirements

## What We're Building

A peer-to-peer car rental platform for Nigeria that connects car owners who want to earn income from their vehicles with renters who need temporary transportation. The platform enables users to list their cars, browse available vehicles, manage bookings through an advanced calendar system, and complete secure transactions.

## MVP Features

### Core Functionality
- Unified user system (users can be both car owners and renters)
- Car listing with photo uploads and basic vehicle details
- Advanced search and filtering (location, price range, car type, dates)
- Interactive calendar availability management for car owners
- Real-time booking system with date selection
- Secure payment processing via Paystack
- Basic rating and review system for trust building
- In-app messaging between car owners and renters
- Booking management and status tracking

### Key Capabilities
- Email and phone verification for users
- Photo upload for car listings
- Location-based car discovery
- Instant booking confirmation
- Payment escrow system
- Basic dispute resolution through messaging
- SMS/Email notifications for booking updates

## Required Pages

### Public Pages
- Landing/Homepage
- Car search and browse page
- Individual car details page
- About Us page
- Contact/Support page

### Car Owner Pages
- Car owner dashboard
- Add new car listing page
- Edit car listing page
- Car availability calendar management
- Booking requests management
- Earnings and payout page

### Renter Pages
- Renter dashboard
- My bookings page
- Booking confirmation page
- Payment page

### Shared User Pages
- User profile page
- Messages/Chat page
- Reviews and ratings page
- Help/FAQ page
- Settings page

### Admin/Management
- Basic admin dashboard (for platform management)

**Total Core Pages: 18**

## Authentication Pages (Supabase Integration)

### User Authentication Flow
- Sign up page
- Sign in page
- Email verification page
- Password reset page
- Forgot password page
- Phone number verification page
- Profile completion page (after initial signup)
- Account verification status page

### Protected Routes
- Email confirmation success page
- Account activation page
- Two-factor authentication setup (future enhancement)

**Total Authentication Pages: 10**

## Technology Stack
- **Frontend**: Angular 17+ (Standalone Components)
- **Authentication**: Supabase Auth
- **Backend**: Supabase (Database + API)
- **Payment**: Paystack Integration
- **File Storage**: Supabase Storage (for car images)
- **Notifications**: Email/SMS via Supabase + third-party service

## Development Phases
1. **Phase 1**: Core pages + Supabase authentication setup
2. **Phase 2**: Car listing and search functionality
3. **Phase 3**: Booking system with calendar integration
4. **Phase 4**: Payment integration and messaging system
5. **Phase 5**: Reviews, notifications, and admin dashboard
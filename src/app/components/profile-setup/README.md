# Profile Setup Component

This component handles the initial profile setup for new users after signup.

## Features

- User type selection (renter/owner)
- Basic profile information collection
- Optional location information
- Skip functionality for users who want to complete later
- Automatic redirect to appropriate dashboard

## Usage

The component is displayed after successful signup to collect additional user information.

## Routes

- `/profile-setup` - Profile setup page (requires authentication)

## Dependencies

- AuthService for profile updates
- Router for navigation
- FormsModule for form handling

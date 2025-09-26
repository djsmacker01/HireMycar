# Password Reset Component

This component handles password reset functionality for users who have forgotten their passwords.

## Features

- Email-based password reset request
- New password input with strength indicator
- Password confirmation
- Success/error state handling
- Automatic redirect after successful reset

## Usage

Users can access this component by clicking "Forgot your password?" on the login modal.

## Routes

- `/reset-password` - Password reset page (public access)

## Dependencies

- AuthService for password reset functionality
- Router for navigation
- FormsModule for form handling

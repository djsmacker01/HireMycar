# Email Verification Component

This component handles email verification for new user accounts.

## Features

- Email verification code input
- Resend verification email functionality
- Success/error state handling
- Automatic redirect after successful verification

## Usage

The component is automatically displayed when a user signs up and needs to verify their email address.

## Routes

- `/verify-email` - Email verification page (requires authentication)

## Dependencies

- AuthService for email verification functionality
- Router for navigation
- FormsModule for form handling

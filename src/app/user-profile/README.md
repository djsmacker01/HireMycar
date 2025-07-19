# User Profile Component

A comprehensive user profile page component for HireMyCar.com.ng that allows both renters and car owners to view and manage their personal information, verification status, and account settings.

## Features

### Profile Header
- User avatar with upload functionality
- Full name and member since date
- Email and phone verification badges
- Edit/Save profile functionality

### Personal Information Section
- Editable fields for full name, email, phone, location, and bio
- Nigerian phone number validation
- Nigerian states dropdown
- Form validation with error messages
- Loading states during save operations

### Document Verification Section
- Driver's License upload status
- ID Photo upload status
- NIN verification status
- Visual progress indicators

### Conditional Sections
- **Car Owner Section**: Host rating, response rate, total cars listed, earnings
- **Renter Section**: Renter rating, trips completed, favorite locations

### Settings Section
- Toggle switches for notification preferences
- Privacy settings
- Account security settings (2FA)

### Activity Summary
- Recent bookings with status and amounts
- Recent messages with timestamps
- Recent reviews with ratings

### Profile Completeness
- Circular progress indicator
- Missing fields checklist
- Dynamic completion calculation

## Usage

Navigate to `/profile` to access the user profile page.

## Responsive Design

The component is fully responsive and adapts to:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Color Scheme

Uses the Nigerian-themed color palette:
- Primary Red: `#dc2626`
- Light Red: `#fef2f2`
- Primary Blue: `#2563eb`
- Primary Green: `#16a34a`
- Primary Yellow: `#eab308`

## File Structure

```
user-profile/
├── user-profile.component.ts      # Component logic and interfaces
├── user-profile.component.html    # Template with conditional rendering
├── user-profile.component.scss    # Responsive styling
└── README.md                     # This documentation
```

## Interfaces

### UserProfile
```typescript
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  bio?: string;
  isCarOwner: boolean;
  isVerifiedEmail: boolean;
  isVerifiedPhone: boolean;
  memberSince: Date;
  profileCompletion: number;
}
```

### VerificationStatus
```typescript
interface VerificationStatus {
  driverLicenseUploaded: boolean;
  idPhotoUploaded: boolean;
  ninVerified: boolean;
}
```

### NotificationSettings
```typescript
interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  profileVisible: boolean;
  twoFactorAuth: boolean;
}
```

## Key Features

1. **Form Validation**: Nigerian phone number format validation
2. **File Upload**: Avatar and document upload functionality
3. **Real-time Updates**: Profile completion calculation
4. **Conditional Rendering**: Different sections for car owners vs renters
5. **Responsive Design**: Mobile-first approach
6. **Accessibility**: Proper ARIA labels and keyboard navigation
7. **Loading States**: Visual feedback during operations
8. **Error Handling**: User-friendly error messages

## Dependencies

- Angular 17+ standalone components
- CommonModule for basic Angular directives
- FormsModule for form handling
- Router for navigation

## Mock Data

The component includes comprehensive mock data for:
- User profile information
- Verification status
- Activity history
- Settings preferences
- Nigerian states list

## Future Enhancements

- Integration with real API endpoints
- Image compression for avatar uploads
- Advanced form validation
- Real-time notifications
- Profile analytics dashboard 
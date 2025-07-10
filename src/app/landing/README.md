# Landing Page Component

A modern, responsive landing page component for HireMyCar.com.ng - Nigeria's peer-to-peer car rental platform.

## Features

- **Hero Section**: Compelling headline with trust indicators and CTA buttons
- **Features Section**: Highlights key platform benefits (Verified Users, Flexible Rentals, Secure Payments)
- **How It Works**: Step-by-step process for both renters and car owners
- **Call-to-Action**: Final conversion section with prominent buttons
- **Footer**: Complete footer with links and branding

## Design Features

- **Mobile-first responsive design**
- **Nigerian-focused color scheme** (Blue, Green, Gold)
- **Modern typography** using Inter font
- **Material Icons** for consistent iconography
- **Smooth animations** and hover effects
- **Accessible design** with proper contrast and focus states

## Component Structure

```
landing/
├── landing.component.ts      # TypeScript component with interfaces
├── landing.component.html    # HTML template
├── landing.component.scss    # SCSS styles
└── README.md                # This documentation
```

## Interfaces

- `Feature`: For features section items
- `HowItWorksStep`: For step-by-step process items
- `TrustIndicator`: For trust badges in hero section

## Usage

The component is automatically loaded as the default route (`/`) in the application.

## Future Enhancements

- Add Angular Material components for better UI consistency
- Implement actual navigation to car search and listing pages
- Add loading states and error handling
- Integrate with backend APIs for dynamic content
- Add analytics tracking for CTA button clicks 
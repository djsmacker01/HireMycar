# Admin Dashboard Component

A comprehensive administrative dashboard for HireMyCar.com.ng that allows platform administrators to monitor, manage, and report on platform performance, users, bookings, and financial activity.

## Features

### Admin Overview Cards
- **Total Users**: Real-time user count with growth indicators
- **Active Listings**: Current active car listings on the platform
- **Monthly Bookings**: Booking statistics for the current month
- **Total Revenue**: Platform revenue with percentage growth
- **Platform Commission**: Admin commission earnings

### User Management
- **Comprehensive User Table**: View all users with detailed information
- **Search & Filter**: Search by name/email, filter by user type and status
- **Verification Status**: Visual badges for email, phone, and ID verification
- **Status Toggle**: Activate/suspend users with one click
- **Pagination**: Navigate through large user datasets

### Car Listings Management
- **Pending Approvals**: Review and approve/reject new listings
- **Flagged Listings**: Manage reported or problematic vehicles
- **Status Tracking**: Real-time status updates for all listings
- **Owner Information**: View listing owner details and contact info

### Financial Overview
- **Revenue Breakdown**: Detailed breakdown of platform revenue
- **Payout Requests**: Manage host payout requests
- **Commission Tracking**: Monitor platform commission earnings
- **Financial Analytics**: Revenue trends and financial health

### Platform Health Metrics
- **Response Time**: Average platform response time
- **User Satisfaction**: Overall user satisfaction score
- **Dispute Management**: Track open and resolved disputes
- **System Health**: Platform performance indicators

### Quick Actions Panel
- **Send Notifications**: Broadcast messages to users
- **Export Reports**: Generate CSV and PDF reports
- **Bulk Operations**: Perform actions on multiple items
- **System Alerts**: Monitor and respond to system alerts

## Usage

Navigate to `/admin` to access the admin dashboard.

## Responsive Design

The component is fully responsive and adapts to:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Color Scheme

Uses the admin-themed color palette:
- Admin Blue: `#1e40af`
- Admin Dark: `#1e293b`
- Primary Red: `#dc2626`
- Primary Green: `#16a34a`
- Primary Yellow: `#eab308`

## File Structure

```
admin-dashboard/
├── admin-dashboard.component.ts      # Component logic and interfaces
├── admin-dashboard.component.html    # Template with admin interface
├── admin-dashboard.component.scss    # Professional admin styling
└── README.md                        # This documentation
```

## Interfaces

### AdminStats
```typescript
interface AdminStats {
  totalUsers: number;
  activeListings: number;
  monthlyBookings: number;
  totalRevenue: number;
  platformCommission: number;
}
```

### UserRecord
```typescript
interface UserRecord {
  id: string;
  name: string;
  email: string;
  type: 'Owner' | 'Renter';
  verified: { email: boolean; phone: boolean; id: boolean };
  joinDate: Date;
  isActive: boolean;
}
```

### ListingRecord
```typescript
interface ListingRecord {
  id: string;
  title: string;
  owner: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Flagged';
  flaggedReason?: string;
  submittedDate: Date;
  carType: string;
  dailyRate: number;
}
```

### PayoutRequest
```typescript
interface PayoutRequest {
  id: string;
  hostName: string;
  amount: number;
  requestDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  bankDetails: string;
}
```

## Key Features

1. **Real-time Updates**: Live data updates and notifications
2. **Advanced Filtering**: Multi-criteria search and filtering
3. **Bulk Operations**: Perform actions on multiple items
4. **Export Functionality**: Generate reports in multiple formats
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
- User management with various statuses
- Listing approvals and flagged content
- Financial transactions and payouts
- Platform health metrics
- Notification templates

## Admin Actions

### User Management
- Toggle user activation status
- View user verification progress
- Search and filter users
- Export user data

### Listing Management
- Approve/reject pending listings
- Review flagged content
- Monitor listing distribution
- Track listing performance

### Financial Management
- Process payout requests
- Monitor revenue streams
- Track commission earnings
- Generate financial reports

### Platform Monitoring
- Monitor system health
- Track user satisfaction
- Manage disputes
- Send platform notifications

## Security Features

- Admin-only access control
- Secure data handling
- Audit trail for actions
- Role-based permissions

## Future Enhancements

- Real-time analytics dashboard
- Advanced reporting tools
- Bulk user operations
- Automated moderation tools
- Integration with external services
- Advanced notification system
- Performance monitoring
- Backup and recovery tools 
# Renter Dashboard Component

A comprehensive dashboard component for HireMyCar.com.ng renters to manage their bookings, rentals, favorites, and view recent platform activity.

## Features

### 📊 Dashboard Overview Cards
- **Upcoming Bookings**: Total number of active bookings
- **Past Rentals**: Total completed rentals  
- **Favorite Cars**: Total number of saved cars
- **Total Spent**: Cumulative ₦ amount across all rentals

### 📅 Upcoming Bookings Section
- Horizontal card layout with car images and booking details
- Status indicators (Confirmed, Upcoming, Cancelled)
- Contact host functionality
- Pickup location and dates display

### 📋 Rental History Table
- Sortable and filterable rental history
- Rating system with star display
- "Rate & Review" functionality for unrated rentals
- Amount paid and duration tracking

### ❤️ Favorite Cars Grid
- Card-based layout for saved cars
- "Book Again" and "Remove from Favorites" actions
- Host information and daily rates
- Rating display

### 📝 Recent Activity Feed
- Real-time activity tracking
- Different activity types (booking, payment, review)
- Timestamp display
- Icon-based visual distinction

### ⚡ Quick Actions
- Find a Car
- View Payment History  
- Update Profile

## Technical Implementation

### Interfaces
```typescript
interface RenterStats {
  upcoming: number;
  pastRentals: number;
  favorites: number;
  totalSpent: number;
}

interface UpcomingBooking {
  id: string;
  carImage: string;
  makeModel: string;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: string;
  status: 'Confirmed' | 'Upcoming' | 'Cancelled';
  amount: number;
  hostName: string;
  hostPhone: string;
}

interface RentalHistory {
  id: string;
  car: string;
  carImage: string;
  dates: { start: Date; end: Date };
  duration: number;
  amountPaid: number;
  rating?: number;
  status: 'Completed' | 'Cancelled';
  hostName: string;
}

interface FavoriteCar {
  id: string;
  image: string;
  title: string;
  dailyRate: number;
  hostName: string;
  location: string;
  rating: number;
}

interface ActivityItem {
  id: string;
  type: 'booking' | 'payment' | 'review';
  message: string;
  timestamp: Date;
  icon: string;
}
```

### Key Methods
- `contactHost()`: Contact booking host
- `openRatingModal()`: Open rating modal for rentals
- `bookAgain()`: Book a car from favorites
- `removeFromFavorites()`: Remove car from favorites
- `formatCurrency()`: Format amounts in Nigerian Naira
- `getStatusColor()`: Get status badge colors
- `showNotificationMessage()`: Display notification messages

## Styling

### Nigerian Color Scheme
- **Primary Blue**: `#2563eb`
- **Success Green**: `#16a34a` 
- **Danger Red**: `#dc2626`
- **Warning Yellow**: `#eab308`
- **Info Cyan**: `#0891b2`

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Horizontal scrolling for booking cards on mobile
- Touch-friendly interactions

## Usage

### Route
```typescript
{ path: 'renter-dashboard', component: RenterDashboardComponent }
```

### Navigation
```typescript
this.router.navigate(['/renter-dashboard']);
```

## Mock Data

The component includes realistic mock data for:
- 2 upcoming bookings with different statuses
- 5 rental history items with mixed ratings
- 3 favorite cars with host information
- 5 activity feed items

## Interactive Features

### Rating Modal
- Star rating system (1-5 stars)
- Optional comment field
- Form validation
- Success notifications

### Notifications
- Success, error, and info notification types
- Auto-dismiss after 3 seconds
- Slide-in animation from right

### Search & Filtering
- Search rentals by car name or host
- Filter by rental status
- Sort by date, amount, duration, or rating

## Browser Support

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Dependencies

- Angular 17+ standalone components
- CommonModule for Angular directives
- FormsModule for ngModel support
- Router for navigation

## Future Enhancements

- Real-time data updates
- Push notifications
- Advanced filtering options
- Export functionality
- Payment integration
- Chat with hosts 
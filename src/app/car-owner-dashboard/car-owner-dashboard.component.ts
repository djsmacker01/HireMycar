import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../services/car.service';
import { AuthService } from '../services/auth.service';
import { SimpleAuthService } from '../services/simple-auth.service';
import { Router } from '@angular/router';

// Interfaces
interface DashboardStats {
  totalEarnings: number;
  activeListings: number;
  pendingBookings: number;
  ratingAverage: number;
}

interface CarListing {
  id: string;
  image: string;
  title: string;
  rate: number;
  status: 'Available' | 'Unavailable';
  views: number;
  lastUpdated: Date;
}

interface BookingRequest {
  id: string;
  renterName: string;
  carTitle: string;
  pickupDate: Date;
  returnDate: Date;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  earnings: number;
  rating?: number;
  renterPhone?: string;
  renterEmail?: string;
}

interface MonthlyEarnings {
  month: string;
  revenue: number;
}

interface FilterOptions {
  status: string;
  dateRange: string;
  earnings: string;
}

@Component({
  selector: 'app-car-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-owner-dashboard.component.html',
  styleUrls: ['./car-owner-dashboard.component.scss']
})
export class CarOwnerDashboardComponent implements OnInit {
  // Dashboard Stats
  dashboardStats: DashboardStats = {
    totalEarnings: 1250000,
    activeListings: 3,
    pendingBookings: 2,
    ratingAverage: 4.8
  };

  // Car Listings
  carListings: CarListing[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      title: 'Toyota Camry 2023',
      rate: 25000,
      status: 'Available',
      views: 156,
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      title: 'Honda Civic 2022',
      rate: 22000,
      status: 'Available',
      views: 89,
      lastUpdated: new Date('2024-01-10')
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      title: 'Lexus RX 2023',
      rate: 35000,
      status: 'Unavailable',
      views: 203,
      lastUpdated: new Date('2024-01-20')
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
      title: 'BMW 3 Series 2022',
      rate: 40000,
      status: 'Available',
      views: 134,
      lastUpdated: new Date('2024-01-18')
    }
  ];

  // Recent Bookings
  recentBookings: BookingRequest[] = [
    {
      id: '1',
      renterName: 'Adebayo Johnson',
      carTitle: 'Toyota Camry 2023',
      pickupDate: new Date('2024-01-15'),
      returnDate: new Date('2024-01-18'),
      status: 'Confirmed',
      earnings: 75000,
      renterPhone: '+234 801 234 5678',
      renterEmail: 'adebayo@email.com'
    },
    {
      id: '2',
      renterName: 'Sarah Okonkwo',
      carTitle: 'Honda Civic 2022',
      pickupDate: new Date('2024-01-20'),
      returnDate: new Date('2024-01-22'),
      status: 'Completed',
      earnings: 44000,
      renterPhone: '+234 802 345 6789',
      renterEmail: 'sarah@email.com'
    },
    {
      id: '3',
      renterName: 'Michael Adebayo',
      carTitle: 'BMW 3 Series 2022',
      pickupDate: new Date('2024-01-25'),
      returnDate: new Date('2024-01-28'),
      status: 'Pending',
      earnings: 120000,
      renterPhone: '+234 803 456 7890',
      renterEmail: 'michael@email.com'
    },
    {
      id: '4',
      renterName: 'Fatima Hassan',
      carTitle: 'Toyota Camry 2023',
      pickupDate: new Date('2024-01-10'),
      returnDate: new Date('2024-01-12'),
      status: 'Cancelled',
      earnings: 50000,
      renterPhone: '+234 804 567 8901',
      renterEmail: 'fatima@email.com'
    },
    {
      id: '5',
      renterName: 'David Okechukwu',
      carTitle: 'Lexus RX 2023',
      pickupDate: new Date('2024-01-30'),
      returnDate: new Date('2024-02-02'),
      status: 'Confirmed',
      earnings: 140000,
      renterPhone: '+234 805 678 9012',
      renterEmail: 'david@email.com'
    }
  ];

  // Pending Booking Requests
  pendingRequests: BookingRequest[] = [
    {
      id: '6',
      renterName: 'Grace Eze',
      carTitle: 'Toyota Camry 2023',
      pickupDate: new Date('2024-02-05'),
      returnDate: new Date('2024-02-08'),
      status: 'Pending',
      earnings: 75000,
      renterPhone: '+234 806 789 0123',
      renterEmail: 'grace@email.com'
    },
    {
      id: '7',
      renterName: 'Kemi Adebayo',
      carTitle: 'Honda Civic 2022',
      pickupDate: new Date('2024-02-10'),
      returnDate: new Date('2024-02-12'),
      status: 'Pending',
      earnings: 44000,
      renterPhone: '+234 807 890 1234',
      renterEmail: 'kemi@email.com'
    }
  ];

  // Monthly Earnings Data
  monthlyEarnings: MonthlyEarnings[] = [
    { month: 'Aug', revenue: 180000 },
    { month: 'Sep', revenue: 220000 },
    { month: 'Oct', revenue: 195000 },
    { month: 'Nov', revenue: 280000 },
    { month: 'Dec', revenue: 320000 },
    { month: 'Jan', revenue: 250000 }
  ];

  // Interactive Features
  searchTerm = '';
  selectedStatus = 'all';
  selectedDateRange = 'all';
  selectedEarningsRange = 'all';
  sortBy = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  showFilters = false;
  selectedBooking: BookingRequest | null = null;
  showBookingDetails = false;
  showCarDetails = false;
  selectedCar: CarListing | null = null;
  isRefreshing = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';

  // Edit Form Properties
  showEditForm = false;
  editFormData = {
    title: '',
    rate: 0,
    status: 'Available' as 'Available' | 'Unavailable'
  };

  // Chart properties
  chartHeight = 200;
  maxRevenue = Math.max(...this.monthlyEarnings.map(e => e.revenue));
  selectedMonth: string | null = null;

  // Filter options
  filterOptions: FilterOptions = {
    status: 'all',
    dateRange: 'all',
    earnings: 'all'
  };

  constructor(
    private router: Router,
    private carService: CarService,
    private authService: AuthService,
    private simpleAuth: SimpleAuthService
  ) { }

  ngOnInit(): void {
    // Check authentication
    this.checkAuthentication();

    this.updateStats();
    this.startAutoRefresh();
    this.loadCarListings();
    this.loadUserBookings();
    this.loadUserReviews();
  }

  private checkAuthentication(): void {
    console.log('Dashboard: Checking authentication...');

    // Use simple auth service for more reliable checking
    this.simpleAuth.debugAuthStatus();

    console.log('Simple Auth - Is authenticated:', this.simpleAuth.isAuthenticated());
    console.log('Simple Auth - Current user:', this.simpleAuth.getCurrentUser());
    console.log('Simple Auth - Current profile:', this.simpleAuth.getCurrentProfile());

    if (!this.simpleAuth.isAuthenticated()) {
      console.log('Dashboard: User not authenticated, redirecting to login');
      this.router.navigate(['/']);
      return;
    }

    console.log('Dashboard: User authenticated, proceeding with dashboard');
  }

  async loadCarListings(): Promise<void> {
    try {
      console.log('Loading car listings from database...');

      // Get current user's ID for filtering
      const currentUser = this.simpleAuth.getCurrentUser();
      const currentProfile = this.simpleAuth.getCurrentProfile();

      console.log('Current user:', currentUser);
      console.log('Current profile:', currentProfile);

      if (!currentUser || !currentProfile) {
        console.log('No current user or profile found');
        return;
      }

      // Fetch only the current user's car listings
      const result = await this.carService.getCarListings(currentProfile.id);
      console.log('Car listings query result:', result);

      if (result.success && result.cars) {
        console.log('User car listings loaded:', result.cars);
        // Convert database cars to display format
        this.carListings = result.cars.map(car => ({
          id: car.id,
          image: car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image',
          title: `${car.make} ${car.model} ${car.year}`,
          rate: car.daily_rate,
          status: car.is_available ? 'Available' : 'Unavailable',
          views: Math.floor(Math.random() * 200) + 50, // Mock views for now
          lastUpdated: new Date(car.updated_at)
        }));

        console.log('Converted user car listings:', this.carListings);
        this.updateStats();
      } else {
        console.log('No car listings found for user or error:', result.error);
        // Keep mock data if no real data
      }
    } catch (error) {
      console.error('Error loading car listings:', error);
      // Keep mock data on error
    }
  }

  // Real-time updates
  private startAutoRefresh(): void {
    setInterval(() => {
      this.updateStats();
    }, 30000); // Update every 30 seconds
  }

  private updateStats(): void {
    console.log('Updating dashboard stats for current user...');

    // Update stats based on user's car listings
    this.dashboardStats.activeListings = this.carListings.filter(car => car.status === 'Available').length;
    this.dashboardStats.pendingBookings = this.pendingRequests.length;
    this.dashboardStats.totalEarnings = this.recentBookings
      .filter(booking => booking.status === 'Completed' || booking.status === 'Confirmed')
      .reduce((total, booking) => total + booking.earnings, 0);

    // Calculate average rating from user's reviews
    const userReviews = this.recentBookings.filter(booking => booking.rating && booking.rating > 0);
    if (userReviews.length > 0) {
      this.dashboardStats.ratingAverage = userReviews.reduce((sum, booking) => sum + (booking.rating || 0), 0) / userReviews.length;
    }

    console.log('Updated dashboard stats:', this.dashboardStats);
  }

  async loadUserBookings(): Promise<void> {
    try {
      const currentProfile = this.simpleAuth.getCurrentProfile();
      if (!currentProfile) {
        console.log('No current profile found for loading bookings');
        return;
      }

      console.log('Loading bookings for user:', currentProfile.id);
      const result = await this.carService.getUserBookings(currentProfile.id);

      if (result.success && result.bookings) {
        console.log('User bookings loaded:', result.bookings);
        // Convert database bookings to display format
        this.recentBookings = result.bookings.map(booking => ({
          id: booking.id,
          renterName: booking.user_profiles?.full_name || 'Unknown User',
          carTitle: `${booking.cars?.make} ${booking.cars?.model} ${booking.cars?.year}`,
          pickupDate: new Date(booking.pickup_date),
          returnDate: new Date(booking.return_date),
          status: booking.status,
          earnings: booking.total_amount || 0,
          rating: booking.rating || 0
        }));

        console.log('Converted user bookings:', this.recentBookings);
        this.updateStats();
      } else {
        console.log('No bookings found for user or error:', result.error);
      }
    } catch (error) {
      console.error('Error loading user bookings:', error);
    }
  }

  async loadUserReviews(): Promise<void> {
    try {
      const currentProfile = this.simpleAuth.getCurrentProfile();
      if (!currentProfile) {
        console.log('No current profile found for loading reviews');
        return;
      }

      console.log('Loading reviews for user:', currentProfile.id);
      const result = await this.carService.getUserReviews(currentProfile.id);

      if (result.success && result.reviews) {
        console.log('User reviews loaded:', result.reviews);
        // You can process reviews here if needed
        this.updateStats();
      } else {
        console.log('No reviews found for user or error:', result.error);
      }
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  }

  // Search and Filter
  get filteredBookings(): BookingRequest[] {
    let filtered = [...this.recentBookings];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(booking =>
        booking.renterName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.carTitle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === this.selectedStatus);
    }

    // Date range filter
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      const daysAgo = this.selectedDateRange === 'week' ? 7 :
        this.selectedDateRange === 'month' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      filtered = filtered.filter(booking => booking.pickupDate >= cutoffDate);
    }

    // Earnings filter
    if (this.selectedEarningsRange !== 'all') {
      const ranges = {
        'low': [0, 50000],
        'medium': [50000, 100000],
        'high': [100000, Infinity]
      };
      const [min, max] = ranges[this.selectedEarningsRange as keyof typeof ranges];
      filtered = filtered.filter(booking => booking.earnings >= min && booking.earnings <= max);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'date':
          comparison = b.pickupDate.getTime() - a.pickupDate.getTime();
          break;
        case 'earnings':
          comparison = b.earnings - a.earnings;
          break;
        case 'renter':
          comparison = a.renterName.localeCompare(b.renterName);
          break;
        case 'car':
          comparison = a.carTitle.localeCompare(b.carTitle);
          break;
      }
      return this.sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }

  get filteredCars(): CarListing[] {
    let filtered = [...this.carListings];

    if (this.searchTerm) {
      filtered = filtered.filter(car =>
        car.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(car => car.status === this.selectedStatus);
    }

    return filtered.sort((a, b) => b.views - a.views);
  }

  // Interactive Actions
  acceptBooking(bookingId: string): void {
    const booking = this.pendingRequests.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'Confirmed';
      this.pendingRequests = this.pendingRequests.filter(b => b.id !== bookingId);
      this.recentBookings.unshift(booking);
      this.updateStats();
      this.showNotificationMessage('Booking accepted successfully!', 'success');
      console.log(`Booking ${bookingId} accepted`);
    }
  }

  declineBooking(bookingId: string): void {
    const booking = this.pendingRequests.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'Cancelled';
      this.pendingRequests = this.pendingRequests.filter(b => b.id !== bookingId);
      this.recentBookings.unshift(booking);
      this.updateStats();
      this.showNotificationMessage('Booking declined', 'info');
      console.log(`Booking ${bookingId} declined`);
    }
  }

  toggleCarStatus(carId: string): void {
    const car = this.carListings.find(c => c.id === carId);
    if (car) {
      car.status = car.status === 'Available' ? 'Unavailable' : 'Available';
      car.lastUpdated = new Date();
      this.updateStats();
      this.showNotificationMessage(`Car status updated to ${car.status}`, 'success');
    }
  }

  viewBookingDetails(booking: BookingRequest): void {
    this.selectedBooking = booking;
    this.showBookingDetails = true;
  }

  viewCarDetails(car: CarListing): void {
    this.selectedCar = car;
    this.showCarDetails = true;
  }

  closeModal(): void {
    this.showBookingDetails = false;
    this.showCarDetails = false;
    this.selectedBooking = null;
    this.selectedCar = null;
  }

  // Chart Interactions
  onBarClick(month: string): void {
    this.selectedMonth = this.selectedMonth === month ? null : month;
    this.showNotificationMessage(`Selected ${month} earnings`, 'info');
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'status-confirmed';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Confirmed':
        return '✓';
      case 'Completed':
        return '✓';
      case 'Cancelled':
        return '✗';
      case 'Pending':
        return '⏳';
      default:
        return '';
    }
  }

  // Navigation methods
  addNewCar(): void {
    this.router.navigate(['/add-car-listing']);
  }

  viewAllBookings(): void {
    console.log('View all bookings');
    this.showNotificationMessage('View all bookings - This would navigate to bookings page', 'info');
  }

  updateCalendar(): void {
    console.log('Update calendar');
    this.showNotificationMessage('Update calendar - This would open calendar management', 'info');
  }

  // Enhanced Edit Car functionality
  editCarListing(carId: string): void {
    console.log(`Editing car listing ${carId}`);
    this.showNotificationMessage('Edit car listing - This would open edit form', 'info');

    // Simulate opening edit modal or form
    const car = this.carListings.find(c => c.id === carId);
    if (car) {
      this.selectedCar = car;
      this.showCarDetails = true;
      this.showNotificationMessage(`Opening edit form for ${car.title}`, 'info');
    }
  }

  // Enhanced Quick Actions
  handleQuickAction(action: string): void {
    switch (action) {
      case 'add-car':
        this.addNewCar();
        break;
      case 'update-calendar':
        this.openCalendarManager();
        break;
      case 'view-all-bookings':
        this.openBookingsPage();
        break;
      case 'export-data':
        this.exportData();
        break;
      default:
        this.showNotificationMessage('Action not implemented yet', 'info');
    }
  }

  openCalendarManager(): void {
    this.showNotificationMessage('Opening Calendar Manager...', 'info');
    // Simulate calendar management interface
    setTimeout(() => {
      this.showNotificationMessage('Calendar updated successfully!', 'success');
    }, 2000);
  }

  openBookingsPage(): void {
    this.showNotificationMessage('Opening All Bookings Page...', 'info');
    // Simulate navigation to bookings page
    setTimeout(() => {
      this.showNotificationMessage('Bookings page loaded with advanced filters', 'success');
    }, 1500);
  }

  // Enhanced View All Bookings functionality
  viewAllBookingsEnhanced(): void {
    this.showNotificationMessage('Loading all bookings with advanced filters...', 'info');

    // Simulate loading more bookings
    setTimeout(() => {
      const additionalBookings: BookingRequest[] = [
        {
          id: '8',
          renterName: 'Aisha Mohammed',
          carTitle: 'Toyota Camry 2023',
          pickupDate: new Date('2024-02-15'),
          returnDate: new Date('2024-02-18'),
          status: 'Confirmed',
          earnings: 75000,
          renterPhone: '+234 808 901 2345',
          renterEmail: 'aisha@email.com'
        },
        {
          id: '9',
          renterName: 'Chukwudi Okonkwo',
          carTitle: 'BMW 3 Series 2022',
          pickupDate: new Date('2024-02-20'),
          returnDate: new Date('2024-02-25'),
          status: 'Pending',
          earnings: 200000,
          renterPhone: '+234 809 012 3456',
          renterEmail: 'chukwudi@email.com'
        }
      ];

      this.recentBookings.push(...additionalBookings);
      this.showNotificationMessage('All bookings loaded successfully!', 'success');
    }, 2000);
  }

  // Enhanced Edit Form
  simulateEditForm(): void {
    if (this.selectedCar) {
      // Populate edit form with current car data
      this.editFormData = {
        title: this.selectedCar.title,
        rate: this.selectedCar.rate,
        status: this.selectedCar.status
      };

      this.showEditForm = true;
      this.showNotificationMessage(`Opening edit form for ${this.selectedCar.title}...`, 'info');
    }
  }

  // Save edited car data
  saveCarEdit(): void {
    if (this.selectedCar && this.editFormData.title.trim()) {
      // Update the car data
      this.selectedCar.title = this.editFormData.title;
      this.selectedCar.rate = this.editFormData.rate;
      this.selectedCar.status = this.editFormData.status;
      this.selectedCar.lastUpdated = new Date();

      // Update the car in the listings array
      const carIndex = this.carListings.findIndex(c => c.id === this.selectedCar?.id);
      if (carIndex !== -1) {
        this.carListings[carIndex] = { ...this.selectedCar };
      }

      this.showEditForm = false;
      this.showNotificationMessage('Car details updated successfully!', 'success');

      // Update dashboard stats
      this.updateStats();
    } else {
      this.showNotificationMessage('Please fill in all required fields', 'error');
    }
  }

  // Cancel edit form
  cancelEdit(): void {
    this.showEditForm = false;
    this.editFormData = {
      title: '',
      rate: 0,
      status: 'Available'
    };
    this.showNotificationMessage('Edit cancelled', 'info');
  }

  // Chart methods
  getBarHeight(revenue: number): number {
    return (revenue / this.maxRevenue) * this.chartHeight;
  }

  getBarColor(revenue: number): string {
    const percentage = revenue / this.maxRevenue;
    if (percentage > 0.8) return '#16a34a'; // Green for high revenue
    if (percentage > 0.5) return '#2563eb'; // Blue for medium revenue
    return '#dc2626'; // Red for low revenue
  }

  isBarSelected(month: string): boolean {
    return this.selectedMonth === month;
  }

  getSelectedMonthRevenue(): string {
    const selectedEarning = this.monthlyEarnings.find(e => e.month === this.selectedMonth);
    return this.formatCurrency(selectedEarning?.revenue || 0);
  }

  // Filter methods
  getConfirmedBookings(): BookingRequest[] {
    return this.recentBookings.filter(booking => booking.status === 'Confirmed');
  }

  getCompletedBookings(): BookingRequest[] {
    return this.recentBookings.filter(booking => booking.status === 'Completed');
  }

  getCancelledBookings(): BookingRequest[] {
    return this.recentBookings.filter(booking => booking.status === 'Cancelled');
  }

  getAvailableCars(): CarListing[] {
    return this.carListings.filter(car => car.status === 'Available');
  }

  getUnavailableCars(): CarListing[] {
    return this.carListings.filter(car => car.status === 'Unavailable');
  }

  // Notification system
  showNotificationMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  // Refresh data
  async refreshData(): Promise<void> {
    this.isRefreshing = true;
    await this.loadCarListings();
    setTimeout(() => {
      this.updateStats();
      this.isRefreshing = false;
      this.showNotificationMessage('Data refreshed successfully!', 'success');
    }, 1000);
  }

  // Clear filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedDateRange = 'all';
    this.selectedEarningsRange = 'all';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.showNotificationMessage('Filters cleared', 'info');
  }

  // Export data
  exportData(): void {
    const data = {
      bookings: this.recentBookings,
      cars: this.carListings,
      stats: this.dashboardStats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-data.json';
    a.click();
    window.URL.revokeObjectURL(url);
    this.showNotificationMessage('Data exported successfully!', 'success');
  }
} 
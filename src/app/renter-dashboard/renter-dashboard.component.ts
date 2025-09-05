import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaces
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

interface FilterOptions {
  status: string;
  dateRange: string;
  amountRange: string;
  rating: string;
}

// New Interfaces for Payment History and Profile
interface PaymentHistory {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'Payment' | 'Refund' | 'Deposit' | 'Withdrawal';
  status: 'Completed' | 'Pending' | 'Failed';
  reference: string;
  method: 'Card' | 'Bank Transfer' | 'Wallet' | 'Cash';
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: Date;
  licenseNumber: string;
  profileImage: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    language: string;
    currency: string;
  };
}

@Component({
  selector: 'app-renter-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renter-dashboard.component.html',
  styleUrls: ['./renter-dashboard.component.scss']
})
export class RenterDashboardComponent implements OnInit, OnDestroy {
  // Dashboard Stats
  renterStats: RenterStats = {
    upcoming: 2,
    pastRentals: 8,
    favorites: 5,
    totalSpent: 450000
  };

  // Upcoming Bookings
  upcomingBookings: UpcomingBooking[] = [
    {
      id: '1',
      carImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      makeModel: 'Toyota Camry 2023',
      pickupDate: new Date('2024-02-15'),
      returnDate: new Date('2024-02-18'),
      pickupLocation: 'Lagos Airport',
      status: 'Confirmed',
      amount: 75000,
      hostName: 'Adebayo Johnson',
      hostPhone: '+234 801 234 5678'
    },
    {
      id: '2',
      carImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      makeModel: 'Honda Civic 2022',
      pickupDate: new Date('2024-02-25'),
      returnDate: new Date('2024-02-27'),
      pickupLocation: 'Victoria Island',
      status: 'Upcoming',
      amount: 66000,
      hostName: 'Sarah Okonkwo',
      hostPhone: '+234 802 345 6789'
    }
  ];

  // Rental History
  rentalHistory: RentalHistory[] = [
    {
      id: '1',
      car: 'Toyota Camry 2023',
      carImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      dates: { start: new Date('2024-01-10'), end: new Date('2024-01-12') },
      duration: 2,
      amountPaid: 50000,
      rating: 5,
      status: 'Completed',
      hostName: 'Adebayo Johnson'
    },
    {
      id: '2',
      car: 'Honda Civic 2022',
      carImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      dates: { start: new Date('2024-01-20'), end: new Date('2024-01-22') },
      duration: 2,
      amountPaid: 44000,
      rating: 4,
      status: 'Completed',
      hostName: 'Sarah Okonkwo'
    },
    {
      id: '3',
      car: 'BMW 3 Series 2022',
      carImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
      dates: { start: new Date('2024-01-25'), end: new Date('2024-01-28') },
      duration: 3,
      amountPaid: 120000,
      status: 'Completed',
      hostName: 'Michael Adebayo'
    },
    {
      id: '4',
      car: 'Lexus RX 2023',
      carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      dates: { start: new Date('2024-01-30'), end: new Date('2024-02-02') },
      duration: 3,
      amountPaid: 140000,
      rating: 5,
      status: 'Completed',
      hostName: 'David Okechukwu'
    },
    {
      id: '5',
      car: 'Toyota Corolla 2021',
      carImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
      dates: { start: new Date('2024-01-05'), end: new Date('2024-01-07') },
      duration: 2,
      amountPaid: 36000,
      status: 'Cancelled',
      hostName: 'Grace Eze'
    }
  ];

  // Favorite Cars
  favoriteCars: FavoriteCar[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      title: 'Toyota Camry 2023',
      dailyRate: 25000,
      hostName: 'Adebayo Johnson',
      location: 'Lagos',
      rating: 4.8
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      title: 'Honda Civic 2022',
      dailyRate: 22000,
      hostName: 'Sarah Okonkwo',
      location: 'Victoria Island',
      rating: 4.5
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
      title: 'BMW 3 Series 2022',
      dailyRate: 40000,
      hostName: 'Michael Adebayo',
      location: 'Lekki',
      rating: 4.9
    }
  ];

  // Activity Feed
  activityFeed: ActivityItem[] = [
    {
      id: '1',
      type: 'booking',
      message: 'Booking Confirmed: Toyota Camry 2023',
      timestamp: new Date('2024-02-10 14:30'),
      icon: '📅'
    },
    {
      id: '2',
      type: 'payment',
      message: 'Payment Completed: ₦75,000 for Honda Civic',
      timestamp: new Date('2024-02-09 16:45'),
      icon: '💳'
    },
    {
      id: '3',
      type: 'review',
      message: 'You rated BMW 3 Series 5 stars',
      timestamp: new Date('2024-02-08 11:20'),
      icon: '⭐'
    },
    {
      id: '4',
      type: 'booking',
      message: 'New booking request: Lexus RX 2023',
      timestamp: new Date('2024-02-07 09:15'),
      icon: '📋'
    },
    {
      id: '5',
      type: 'payment',
      message: 'Payment Refunded: ₦36,000 for cancelled booking',
      timestamp: new Date('2024-02-06 13:30'),
      icon: '💰'
    }
  ];

  // Payment History Data
  paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      date: new Date('2024-02-10 14:30'),
      description: 'Payment for Toyota Camry 2023',
      amount: 75000,
      type: 'Payment',
      status: 'Completed',
      reference: 'TXN-2024-001',
      method: 'Card'
    },
    {
      id: '2',
      date: new Date('2024-02-09 16:45'),
      description: 'Payment for Honda Civic 2022',
      amount: 66000,
      type: 'Payment',
      status: 'Completed',
      reference: 'TXN-2024-002',
      method: 'Card'
    },
    {
      id: '3',
      date: new Date('2024-02-08 11:20'),
      description: 'Refund for cancelled booking',
      amount: -36000,
      type: 'Refund',
      status: 'Completed',
      reference: 'REF-2024-001',
      method: 'Bank Transfer'
    },
    {
      id: '4',
      date: new Date('2024-02-07 09:15'),
      description: 'Wallet top-up',
      amount: 50000,
      type: 'Deposit',
      status: 'Completed',
      reference: 'DEP-2024-001',
      method: 'Bank Transfer'
    },
    {
      id: '5',
      date: new Date('2024-02-06 13:30'),
      description: 'Payment for BMW 3 Series',
      amount: 120000,
      type: 'Payment',
      status: 'Completed',
      reference: 'TXN-2024-003',
      method: 'Card'
    },
    {
      id: '6',
      date: new Date('2024-02-05 10:20'),
      description: 'Payment for Lexus RX 2023',
      amount: 140000,
      type: 'Payment',
      status: 'Completed',
      reference: 'TXN-2024-004',
      method: 'Card'
    }
  ];

  // User Profile Data
  userProfile: UserProfile = {
    id: '1',
    firstName: 'Adebayo',
    lastName: 'Johnson',
    email: 'adebayo.johnson@email.com',
    phone: '+234 801 234 5678',
    address: '123 Victoria Island',
    city: 'Lagos',
    state: 'Lagos',
    zipCode: '100001',
    dateOfBirth: new Date('1990-05-15'),
    licenseNumber: 'NGR-2024-123456',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false,
      language: 'English',
      currency: 'NGN'
    }
  };

  // Interactive Features
  searchTerm = '';
  selectedStatus = 'all';
  sortBy = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  showRatingModal = false;
  selectedRental: RentalHistory | null = null;
  ratingValue = 0;
  ratingComment = '';
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';

  // Enhanced Interactive Features
  showFilters = false;
  showAdvancedSearch = false;
  isLoading = false;
  isRefreshing = false;
  selectedBooking: UpcomingBooking | null = null;
  showBookingDetails = false;
  showContactModal = false;
  contactMessage = '';
  showExportModal = false;
  exportFormat = 'pdf';
  showDeleteConfirm = false;
  itemToDelete: any = null;
  deleteType = '';

  // Payment History Features
  showPaymentHistory = false;
  paymentHistoryFilter = 'all';
  paymentHistorySortBy = 'date';
  paymentHistorySortOrder: 'asc' | 'desc' = 'desc';

  // Profile Update Features
  showProfileModal = false;
  editingProfile: UserProfile | null = null;
  profileFormData: any = {};
  showPasswordModal = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Filter Options
  filterOptions: FilterOptions = {
    status: 'all',
    dateRange: 'all',
    amountRange: 'all',
    rating: 'all'
  };

  // Animation States
  animateStats = false;
  animateCards = false;
  animateTable = false;

  // Real-time Updates
  private updateInterval: any;
  public lastUpdate = new Date();

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  // Math object for template access
  Math = Math;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateStats();
    this.startRealTimeUpdates();
    this.initializeAnimations();
    this.calculatePagination();
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Real-time updates
  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateStats();
      this.addRandomActivity();
      this.lastUpdate = new Date();
    }, 30000); // Update every 30 seconds
  }

  private initializeAnimations(): void {
    // Trigger animations on component load
    setTimeout(() => {
      this.animateStats = true;
    }, 100);

    setTimeout(() => {
      this.animateCards = true;
    }, 300);

    setTimeout(() => {
      this.animateTable = true;
    }, 500);
  }

  private addRandomActivity(): void {
    const activities = [
      { type: 'booking', message: 'New booking request received', icon: '📅' },
      { type: 'payment', message: 'Payment processed successfully', icon: '💳' },
      { type: 'review', message: 'New review submitted', icon: '⭐' }
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: randomActivity.type as any,
      message: randomActivity.message,
      timestamp: new Date(),
      icon: randomActivity.icon
    };

    this.activityFeed.unshift(newActivity);
    if (this.activityFeed.length > 10) {
      this.activityFeed.pop();
    }
  }

  // Update dashboard stats
  private updateStats(): void {
    this.renterStats.upcoming = this.upcomingBookings.length;
    this.renterStats.pastRentals = this.rentalHistory.length;
    this.renterStats.favorites = this.favoriteCars.length;
    this.renterStats.totalSpent = this.rentalHistory
      .filter(rental => rental.status === 'Completed')
      .reduce((total, rental) => total + rental.amountPaid, 0);
  }

  // Contact host with enhanced functionality
  contactHost(booking: UpcomingBooking): void {
    this.selectedBooking = booking;
    this.contactMessage = '';
    this.showContactModal = true;
  }

  sendMessage(): void {
    if (this.contactMessage.trim()) {
      console.log(`Sending message to ${this.selectedBooking?.hostName}: ${this.contactMessage}`);
      this.showNotificationMessage(`Message sent to ${this.selectedBooking?.hostName}`, 'success');
      this.showContactModal = false;
      this.selectedBooking = null;
      this.contactMessage = '';
    }
  }

  // Enhanced rating system
  openRatingModal(rental: RentalHistory): void {
    this.selectedRental = rental;
    this.ratingValue = 0;
    this.ratingComment = '';
    this.showRatingModal = true;
  }

  submitRating(): void {
    if (this.selectedRental && this.ratingValue > 0) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        this.selectedRental!.rating = this.ratingValue;
        this.showRatingModal = false;
        this.showNotificationMessage('Thank you for your review!', 'success');
        this.isLoading = false;
        console.log(`Rating submitted: ${this.ratingValue} stars for ${this.selectedRental!.car}`);
      }, 1000);
    }
  }

  cancelRating(): void {
    this.showRatingModal = false;
    this.selectedRental = null;
  }

  // Enhanced booking functionality
  bookAgain(car: FavoriteCar): void {
    this.isLoading = true;
    console.log(`Booking again: ${car.title}`);
    
    setTimeout(() => {
      this.showNotificationMessage(`Redirecting to book ${car.title}...`, 'info');
      this.isLoading = false;
      this.router.navigate(['/car', car.id]);
    }, 1500);
  }

  // Enhanced remove from favorites with confirmation
  removeFromFavorites(carId: string): void {
    this.itemToDelete = carId;
    this.deleteType = 'favorite';
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.deleteType === 'favorite') {
      this.favoriteCars = this.favoriteCars.filter(car => car.id !== this.itemToDelete);
      this.updateStats();
      this.showNotificationMessage('Car removed from favorites', 'success');
    }
    this.showDeleteConfirm = false;
    this.itemToDelete = null;
    this.deleteType = '';
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.itemToDelete = null;
    this.deleteType = '';
  }

  // Enhanced quick actions
  findCar(): void {
    this.isLoading = true;
    console.log('Navigating to car search');
    
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/search']);
    }, 1000);
  }

  // Payment History Functions
  viewPaymentHistory(): void {
    this.showPaymentHistory = true;
    this.paymentHistoryFilter = 'all';
    this.paymentHistorySortBy = 'date';
    this.paymentHistorySortOrder = 'desc';
  }

  closePaymentHistory(): void {
    this.showPaymentHistory = false;
  }

  get filteredPaymentHistory(): PaymentHistory[] {
    let filtered = this.paymentHistory;
    
    if (this.paymentHistoryFilter !== 'all') {
      filtered = filtered.filter(payment => payment.type === this.paymentHistoryFilter);
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.paymentHistorySortBy) {
        case 'date': {
          comparison = b.date.getTime() - a.date.getTime();
          break;
        }
        case 'amount': {
          comparison = b.amount - a.amount;
          break;
        }
        case 'type': {
          comparison = a.type.localeCompare(b.type);
          break;
        }
      }
      return this.paymentHistorySortOrder === 'asc' ? -comparison : comparison;
    });
    
    return filtered;
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'status-confirmed';
      case 'Pending': return 'status-upcoming';
      case 'Failed': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  getPaymentTypeIcon(type: string): string {
    switch (type) {
      case 'Payment': return '💳';
      case 'Refund': return '💰';
      case 'Deposit': return '📥';
      case 'Withdrawal': return '📤';
      default: return '💳';
    }
  }

  // Profile Update Functions
  updateProfile(): void {
    this.editingProfile = { ...this.userProfile };
    this.profileFormData = { ...this.userProfile };
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.editingProfile = null;
    this.profileFormData = {};
  }

  saveProfile(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.userProfile = { ...this.profileFormData };
      this.showProfileModal = false;
      this.showNotificationMessage('Profile updated successfully!', 'success');
      this.isLoading = false;
      console.log('Profile updated:', this.userProfile);
    }, 1500);
  }

  openPasswordModal(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showNotificationMessage('New passwords do not match!', 'error');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.showNotificationMessage('Password must be at least 8 characters!', 'error');
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.showPasswordModal = false;
      this.showNotificationMessage('Password changed successfully!', 'success');
      this.isLoading = false;
      console.log('Password changed');
    }, 1500);
  }

  // Advanced filtering and search
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.filterOptions = {
      status: 'all',
      dateRange: 'all',
      amountRange: 'all',
      rating: 'all'
    };
    this.currentPage = 1;
    this.showNotificationMessage('All filters cleared', 'info');
  }

  // Export functionality
  openExportModal(): void {
    this.showExportModal = true;
  }

  exportData(): void {
    this.isLoading = true;
    console.log(`Exporting data in ${this.exportFormat} format`);
    
    setTimeout(() => {
      this.showNotificationMessage(`Data exported successfully in ${this.exportFormat.toUpperCase()} format`, 'success');
      this.showExportModal = false;
      this.isLoading = false;
    }, 2000);
  }

  // Refresh data
  refreshData(): void {
    this.isRefreshing = true;
    console.log('Refreshing dashboard data...');
    
    setTimeout(() => {
      this.updateStats();
      this.calculatePagination();
      this.showNotificationMessage('Dashboard refreshed successfully', 'success');
      this.isRefreshing = false;
    }, 1500);
  }

  // Pagination
  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRentalHistory.length / this.itemsPerPage);
  }

  get paginatedRentals(): RentalHistory[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRentalHistory.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Confirmed': return 'status-confirmed';
      case 'Upcoming': return 'status-upcoming';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Confirmed': return '✓';
      case 'Upcoming': return '⏳';
      case 'Completed': return '✓';
      case 'Cancelled': return '✗';
      default: return '•';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'booking': return '📅';
      case 'payment': return '💳';
      case 'review': return '⭐';
      default: return '📝';
    }
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  // Enhanced filter and sort methods
  get filteredRentalHistory(): RentalHistory[] {
    let filtered = this.rentalHistory;
    
    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(rental => rental.status === this.selectedStatus);
    }
    
    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(rental => 
        rental.car.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        rental.hostName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Advanced filters
    if (this.filterOptions.dateRange !== 'all') {
      const now = new Date();
      const daysAgo = this.filterOptions.dateRange === 'week' ? 7 : 
                     this.filterOptions.dateRange === 'month' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(rental => rental.dates.start >= cutoffDate);
    }
    
    if (this.filterOptions.amountRange !== 'all') {
      const ranges = {
        'low': [0, 50000],
        'medium': [50000, 100000],
        'high': [100000, Infinity]
      };
      const [min, max] = ranges[this.filterOptions.amountRange as keyof typeof ranges];
      filtered = filtered.filter(rental => rental.amountPaid >= min && rental.amountPaid <= max);
    }
    
    if (this.filterOptions.rating !== 'all') {
      const ratingValue = parseInt(this.filterOptions.rating);
      filtered = filtered.filter(rental => rental.rating === ratingValue);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'date': {
          comparison = b.dates.start.getTime() - a.dates.start.getTime();
          break;
        }
        case 'amount': {
          comparison = b.amountPaid - a.amountPaid;
          break;
        }
        case 'duration': {
          comparison = b.duration - a.duration;
          break;
        }
        case 'rating': {
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        }
      }
      return this.sortOrder === 'asc' ? -comparison : comparison;
    });
    
    return filtered;
  }

  get unratedRentals(): RentalHistory[] {
    return this.rentalHistory.filter(rental => 
      rental.status === 'Completed' && !rental.rating
    );
  }

  get completedRentals(): RentalHistory[] {
    return this.rentalHistory.filter(rental => rental.status === 'Completed');
  }

  get totalSpent(): number {
    return this.completedRentals.reduce((total, rental) => total + rental.amountPaid, 0);
  }

  // Computed Properties for Payment History
  get totalPayments(): number {
    return this.paymentHistory
      .filter(p => p.type === 'Payment')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  get totalRefunds(): number {
    return this.paymentHistory
      .filter(p => p.type === 'Refund')
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);
  }

  get netAmount(): number {
    return this.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  }

  // Animation helpers
  get animationDelay(): string {
    return '0.1s';
  }

  get isDataLoading(): boolean {
    return this.isLoading || this.isRefreshing;
  }

  // Track By Functions for Performance
  trackByBookingId(index: number, booking: UpcomingBooking): string {
    return booking.id;
  }

  trackByRentalId(index: number, rental: RentalHistory): string {
    return rental.id;
  }

  trackByCarId(index: number, car: FavoriteCar): string {
    return car.id;
  }

  trackByActivityId(index: number, activity: ActivityItem): string {
    return activity.id;
  }

  trackByPaymentId(index: number, payment: PaymentHistory): string {
    return payment.id;
  }
} 
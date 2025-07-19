import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaces
interface AdminStats {
  totalUsers: number;
  activeListings: number;
  monthlyBookings: number;
  totalRevenue: number;
  platformCommission: number;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  type: 'Owner' | 'Renter';
  verified: { email: boolean; phone: boolean; id: boolean };
  joinDate: Date;
  isActive: boolean;
}

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

interface BookingAnalytics {
  month: string;
  bookings: number;
  revenue: number;
}

interface PopularCarType {
  type: string;
  count: number;
  percentage: number;
}

interface PayoutRequest {
  id: string;
  hostName: string;
  amount: number;
  requestDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  bankDetails: string;
}

interface PlatformHealth {
  avgResponseTime: number;
  userSatisfactionScore: number;
  openDisputes: number;
  activeDisputes: number;
  resolvedDisputes: number;
}

interface LocationDistribution {
  state: string;
  listings: number;
  percentage: number;
}

interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Admin Stats
  adminStats: AdminStats = {
    totalUsers: 2847,
    activeListings: 156,
    monthlyBookings: 892,
    totalRevenue: 45600000,
    platformCommission: 4560000
  };

  // User Management
  users: UserRecord[] = [
    {
      id: '1',
      name: 'Adebayo Johnson',
      email: 'adebayo.johnson@email.com',
      type: 'Owner',
      verified: { email: true, phone: true, id: true },
      joinDate: new Date('2023-06-15'),
      isActive: true
    },
    {
      id: '2',
      name: 'Sarah Okonkwo',
      email: 'sarah.okonkwo@email.com',
      type: 'Renter',
      verified: { email: true, phone: true, id: false },
      joinDate: new Date('2023-08-22'),
      isActive: true
    },
    {
      id: '3',
      name: 'Michael Adebayo',
      email: 'michael.adebayo@email.com',
      type: 'Owner',
      verified: { email: true, phone: false, id: true },
      joinDate: new Date('2023-07-10'),
      isActive: true
    },
    {
      id: '4',
      name: 'Grace Eze',
      email: 'grace.eze@email.com',
      type: 'Renter',
      verified: { email: true, phone: true, id: true },
      joinDate: new Date('2023-09-05'),
      isActive: false
    },
    {
      id: '5',
      name: 'David Okechukwu',
      email: 'david.okechukwu@email.com',
      type: 'Owner',
      verified: { email: true, phone: true, id: true },
      joinDate: new Date('2023-05-20'),
      isActive: true
    },
    {
      id: '6',
      name: 'Fatima Hassan',
      email: 'fatima.hassan@email.com',
      type: 'Renter',
      verified: { email: true, phone: false, id: false },
      joinDate: new Date('2023-10-12'),
      isActive: true
    },
    {
      id: '7',
      name: 'Chukwudi Nwankwo',
      email: 'chukwudi.nwankwo@email.com',
      type: 'Owner',
      verified: { email: true, phone: true, id: true },
      joinDate: new Date('2023-04-18'),
      isActive: true
    }
  ];

  // Listing Management
  listings: ListingRecord[] = [
    {
      id: '1',
      title: 'Toyota Camry 2023 - Clean & Reliable',
      owner: 'Adebayo Johnson',
      location: 'Lagos',
      status: 'Pending',
      submittedDate: new Date('2024-02-10'),
      carType: 'Sedan',
      dailyRate: 25000
    },
    {
      id: '2',
      title: 'Honda Civic 2022 - Perfect for City Driving',
      owner: 'Michael Adebayo',
      location: 'Abuja',
      status: 'Pending',
      submittedDate: new Date('2024-02-09'),
      carType: 'Sedan',
      dailyRate: 22000
    },
    {
      id: '3',
      title: 'BMW 3 Series 2022 - Luxury Experience',
      owner: 'David Okechukwu',
      location: 'Lagos',
      status: 'Flagged',
      flaggedReason: 'Inappropriate content in description',
      submittedDate: new Date('2024-02-08'),
      carType: 'Luxury',
      dailyRate: 45000
    },
    {
      id: '4',
      title: 'Toyota Corolla 2021 - Economical Choice',
      owner: 'Chukwudi Nwankwo',
      location: 'Port Harcourt',
      status: 'Pending',
      submittedDate: new Date('2024-02-07'),
      carType: 'Sedan',
      dailyRate: 18000
    },
    {
      id: '5',
      title: 'Lexus RX 2023 - Premium SUV',
      owner: 'Adebayo Johnson',
      location: 'Lagos',
      status: 'Flagged',
      flaggedReason: 'Suspicious pricing',
      submittedDate: new Date('2024-02-06'),
      carType: 'SUV',
      dailyRate: 60000
    }
  ];

  // Booking Analytics
  bookingAnalytics: BookingAnalytics[] = [
    { month: 'Sep 2023', bookings: 156, revenue: 8900000 },
    { month: 'Oct 2023', bookings: 189, revenue: 10200000 },
    { month: 'Nov 2023', bookings: 234, revenue: 13400000 },
    { month: 'Dec 2023', bookings: 298, revenue: 16700000 },
    { month: 'Jan 2024', bookings: 345, revenue: 19800000 },
    { month: 'Feb 2024', bookings: 892, revenue: 45600000 }
  ];

  popularCarTypes: PopularCarType[] = [
    { type: 'Toyota Camry', count: 234, percentage: 35 },
    { type: 'Honda Civic', count: 189, percentage: 28 },
    { type: 'BMW 3 Series', count: 98, percentage: 15 },
    { type: 'Lexus RX', count: 76, percentage: 11 },
    { type: 'Toyota Corolla', count: 67, percentage: 10 },
    { type: 'Others', count: 12, percentage: 1 }
  ];

  // Payout Requests
  payoutRequests: PayoutRequest[] = [
    {
      id: '1',
      hostName: 'Adebayo Johnson',
      amount: 450000,
      requestDate: new Date('2024-02-10'),
      status: 'Pending',
      bankDetails: 'GT Bank - 0123456789'
    },
    {
      id: '2',
      hostName: 'David Okechukwu',
      amount: 320000,
      requestDate: new Date('2024-02-09'),
      status: 'Pending',
      bankDetails: 'Zenith Bank - 0987654321'
    },
    {
      id: '3',
      hostName: 'Chukwudi Nwankwo',
      amount: 280000,
      requestDate: new Date('2024-02-08'),
      status: 'Approved',
      bankDetails: 'Access Bank - 1122334455'
    },
    {
      id: '4',
      hostName: 'Michael Adebayo',
      amount: 195000,
      requestDate: new Date('2024-02-07'),
      status: 'Rejected',
      bankDetails: 'UBA - 5566778899'
    }
  ];

  // Platform Health
  platformHealth: PlatformHealth = {
    avgResponseTime: 2.3,
    userSatisfactionScore: 4.6,
    openDisputes: 8,
    activeDisputes: 12,
    resolvedDisputes: 156
  };

  // Location Distribution
  locationDistribution: LocationDistribution[] = [
    { state: 'Lagos', listings: 67, percentage: 43 },
    { state: 'Abuja', listings: 34, percentage: 22 },
    { state: 'Port Harcourt', listings: 23, percentage: 15 },
    { state: 'Kano', listings: 18, percentage: 12 },
    { state: 'Kaduna', listings: 14, percentage: 9 }
  ];

  // Notification Templates
  notificationTemplates: NotificationTemplate[] = [
    {
      id: '1',
      title: 'Platform Maintenance',
      message: 'Scheduled maintenance on Sunday 2AM-4AM',
      type: 'info'
    },
    {
      id: '2',
      title: 'New Features Available',
      message: 'Enhanced booking system and improved UI',
      type: 'success'
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'Please update your password for security',
      type: 'warning'
    }
  ];

  // Component State
  searchTerm = '';
  selectedUserType = 'all';
  selectedUserStatus = 'all';
  selectedListingStatus = 'all';
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';
  currentView = 'overview';
  selectedNotificationTemplate: NotificationTemplate | null = null;
  showNotificationModal = false;
  notificationRecipients = 'all';
  
  // Dynamic State
  isRefreshing = false;
  showRealTimeUpdates = true;
  autoRefreshInterval: any;
  lastUpdateTime = new Date();
  systemHealth = 'excellent';
  activeUsers = 0;
  pendingActions = 0;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Math for template
  Math = Math;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.calculatePagination();
    this.initializeRealTimeUpdates();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeRealTimeUpdates(): void {
    // Simulate real-time updates
    this.autoRefreshInterval = setInterval(() => {
      this.updateStats();
      this.updateSystemHealth();
      this.updateActiveUsers();
      this.lastUpdateTime = new Date();
    }, 30000); // Update every 30 seconds
  }

  private updateSystemHealth(): void {
    const healthLevels = ['excellent', 'good', 'fair', 'poor'];
    const randomIndex = Math.floor(Math.random() * 4);
    this.systemHealth = healthLevels[randomIndex];
  }

  private updateActiveUsers(): void {
    this.activeUsers = Math.floor(Math.random() * 50) + 150; // 150-200 active users
  }

  private updateStats(): void {
    // Simulate real-time stat updates
    this.adminStats.monthlyBookings += Math.floor(Math.random() * 5);
    this.adminStats.totalRevenue += Math.floor(Math.random() * 100000);
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  // User Management
  get filteredUsers(): UserRecord[] {
    let filtered = this.users;

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    if (this.selectedUserType !== 'all') {
      filtered = filtered.filter(user => user.type === this.selectedUserType);
    }

    if (this.selectedUserStatus !== 'all') {
      const isActive = this.selectedUserStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    return filtered;
  }

  get paginatedUsers(): UserRecord[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  toggleUserStatus(user: UserRecord): void {
    this.isLoading = true;
    
    setTimeout(() => {
      user.isActive = !user.isActive;
      this.isLoading = false;
      this.showNotificationMessage(
        `${user.name} ${user.isActive ? 'activated' : 'suspended'} successfully`,
        'success'
      );
    }, 1000);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  // Listing Management
  get filteredListings(): ListingRecord[] {
    let filtered = this.listings;

    if (this.selectedListingStatus !== 'all') {
      filtered = filtered.filter(listing => listing.status === this.selectedListingStatus);
    }

    return filtered;
  }

  approveListing(listing: ListingRecord): void {
    this.isLoading = true;
    
    setTimeout(() => {
      listing.status = 'Approved';
      this.isLoading = false;
      this.showNotificationMessage(
        `Listing "${listing.title}" approved successfully`,
        'success'
      );
    }, 1000);
  }

  rejectListing(listing: ListingRecord): void {
    this.isLoading = true;
    
    setTimeout(() => {
      listing.status = 'Flagged';
      listing.flaggedReason = 'Rejected by admin';
      this.isLoading = false;
      this.showNotificationMessage(
        `Listing "${listing.title}" rejected`,
        'error'
      );
    }, 1000);
  }

  // Payout Management
  approvePayout(payout: PayoutRequest): void {
    this.isLoading = true;
    
    setTimeout(() => {
      payout.status = 'Approved';
      this.isLoading = false;
      this.showNotificationMessage(
        `Payout of ₦${this.formatCurrency(payout.amount)} approved for ${payout.hostName}`,
        'success'
      );
    }, 1000);
  }

  holdPayout(payout: PayoutRequest): void {
    this.isLoading = true;
    
    setTimeout(() => {
      payout.status = 'Rejected';
      this.isLoading = false;
      this.showNotificationMessage(
        `Payout of ₦${this.formatCurrency(payout.amount)} held for ${payout.hostName}`,
        'error'
      );
    }, 1000);
  }

  // Notification System
  openNotificationModal(template: NotificationTemplate): void {
    this.selectedNotificationTemplate = template;
    this.showNotificationModal = true;
  }

  closeNotificationModal(): void {
    this.showNotificationModal = false;
    this.selectedNotificationTemplate = null;
    this.notificationRecipients = 'all';
  }

  sendNotification(): void {
    if (!this.selectedNotificationTemplate) return;

    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.showNotificationModal = false;
      this.showNotificationMessage(
        `Notification sent to ${this.notificationRecipients} users`,
        'success'
      );
    }, 1500);
  }

  // Export Functions
  exportCSV(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.showNotificationMessage('CSV report exported successfully', 'success');
    }, 2000);
  }

  exportPDF(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.showNotificationMessage('PDF report exported successfully', 'success');
    }, 2000);
  }

  // Dynamic Utility Functions
  refreshData(): void {
    this.isRefreshing = true;
    
    setTimeout(() => {
      this.updateStats();
      this.updateSystemHealth();
      this.updateActiveUsers();
      this.lastUpdateTime = new Date();
      this.isRefreshing = false;
      this.showNotificationMessage('Data refreshed successfully', 'success');
    }, 2000);
  }

  toggleRealTimeUpdates(): void {
    this.showRealTimeUpdates = !this.showRealTimeUpdates;
    
    if (this.showRealTimeUpdates) {
      this.initializeRealTimeUpdates();
      this.showNotificationMessage('Real-time updates enabled', 'info');
    } else {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
      }
      this.showNotificationMessage('Real-time updates disabled', 'info');
    }
  }

  getSystemHealthColor(): string {
    switch (this.systemHealth) {
      case 'excellent': return '#16a34a';
      case 'good': return '#eab308';
      case 'fair': return '#f97316';
      case 'poor': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getSystemHealthIcon(): string {
    switch (this.systemHealth) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'fair': return '🟠';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  }

  // Utility Functions
  showNotificationMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getVerificationStatus(user: UserRecord): string {
    const verified = Object.values(user.verified).filter(Boolean).length;
    const total = Object.keys(user.verified).length;
    return `${verified}/${total}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Approved': return '#16a34a';
      case 'Pending': return '#eab308';
      case 'Flagged': return '#dc2626';
      case 'Rejected': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Approved': return '✅';
      case 'Pending': return '⏳';
      case 'Flagged': return '🚩';
      case 'Rejected': return '❌';
      default: return '📋';
    }
  }

  getTypeColor(type: string): string {
    return type === 'Owner' ? '#2563eb' : '#16a34a';
  }

  getHealthColor(score: number): string {
    if (score >= 4.5) return '#16a34a';
    if (score >= 4.0) return '#eab308';
    return '#dc2626';
  }

  // Chart Data Helpers
  getBookingChartData(): any[] {
    return this.bookingAnalytics.map(item => ({
      month: item.month,
      bookings: item.bookings,
      revenue: item.revenue
    }));
  }

  getRevenueChartData(): any[] {
    return this.bookingAnalytics.map(item => ({
      month: item.month,
      revenue: item.revenue / 1000000 // Convert to millions
    }));
  }

  getLocationChartData(): any[] {
    return this.locationDistribution.map(item => ({
      state: item.state,
      listings: item.listings,
      percentage: item.percentage
    }));
  }

  // Track by functions for ngFor
  trackByUserId(index: number, user: UserRecord): string {
    return user.id;
  }

  trackByListingId(index: number, listing: ListingRecord): string {
    return listing.id;
  }

  trackByPayoutId(index: number, payout: PayoutRequest): string {
    return payout.id;
  }

  trackByNotificationId(index: number, notification: NotificationTemplate): string {
    return notification.id;
  }
} 
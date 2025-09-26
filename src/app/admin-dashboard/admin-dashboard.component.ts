import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CarService } from '../services/car.service';
import { SupportService } from '../services/support.service';
import { ReviewService } from '../services/review.service';

// Modern Interfaces
interface AdminStats {
    totalUsers: number;
    activeListings: number;
    monthlyBookings: number;
    totalRevenue: number;
    platformCommission: number;
    openTickets: number;
    pendingReviews: number;
}

interface StatCard {
    id: string;
    title: string;
    value: number;
    icon: string;
    type: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    description: string;
}

interface UserRecord {
    id: string;
    name: string;
    email: string;
    type: 'Owner' | 'Renter';
    verified: { email: boolean; phone: boolean; id: boolean };
    joinDate: Date;
    isActive: boolean;
    lastLogin: Date;
    totalBookings?: number;
    totalEarnings?: number;
}

interface ActivityItem {
    id: string;
    type: 'user' | 'booking' | 'listing' | 'payment' | 'system';
    icon: string;
    message: string;
    timestamp: Date;
}

interface HealthMetric {
    id: string;
    label: string;
    value: string;
    percentage: number;
    status: 'good' | 'warning' | 'critical';
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    // Core Properties
    private destroy$ = new Subject<void>();
    private refreshInterval$ = interval(30000); // 30 seconds

    // State Management
    isLoading = false;
    isRefreshing = false;
    isMobile = false;
    showMobileMenu = false;
    showNotification = false;
    notificationMessage = '';
    notificationType: 'success' | 'error' | 'warning' | 'info' = 'info';

    // Data Properties
    adminStats: AdminStats = {
        totalUsers: 0,
        activeListings: 0,
        monthlyBookings: 0,
        totalRevenue: 0,
        platformCommission: 0,
        openTickets: 0,
        pendingReviews: 0
    };

    statsData: StatCard[] = [];
    users: UserRecord[] = [];
    recentActivity: ActivityItem[] = [];
    healthMetrics: HealthMetric[] = [];

    // Filtering & Pagination
    searchTerm = '';
    selectedUserType = 'all';
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 1;

    // System Status
    systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    lastUpdateTime = new Date();
    activeUsers = 0;
    pendingPayouts = 0;

    constructor(
        private router: Router,
        private authService: AuthService,
        private carService: CarService,
        private supportService: SupportService,
        private reviewService: ReviewService
    ) {
        this.checkMobileView();
    }

    ngOnInit(): void {
        this.initializeDashboard();
        this.setupAutoRefresh();
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any): void {
        this.checkMobileView();
    }

    // Initialization Methods
    private initializeDashboard(): void {
        console.log('Admin Dashboard: Initializing...');
        this.setupStatsData();
        this.setupHealthMetrics();
        this.setupRecentActivity();
    }

    private setupAutoRefresh(): void {
        this.refreshInterval$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            if (!this.isRefreshing) {
                this.refreshData();
            }
        });
    }

    private checkMobileView(): void {
        this.isMobile = window.innerWidth < 768;
    }

    // Data Loading Methods
    private async loadDashboardData(): Promise<void> {
        try {
            this.isLoading = true;
            console.log('Admin Dashboard: Loading data...');

            // Load all data in parallel
            await Promise.all([
                this.loadAdminStats(),
                this.loadUsers(),
                this.loadRecentActivity(),
                this.updateSystemHealth()
            ]);

            this.lastUpdateTime = new Date();
            console.log('Admin Dashboard: Data loaded successfully');
        } catch (error) {
            console.error('Admin Dashboard: Error loading data:', error);
            this.showNotificationMessage('Error loading dashboard data', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    private async loadAdminStats(): Promise<void> {
        try {
            // Simulate API calls - replace with real data loading
            this.adminStats = {
                totalUsers: 2847,
                activeListings: 156,
                monthlyBookings: 892,
                totalRevenue: 45600000,
                platformCommission: 4560000,
                openTickets: 12,
                pendingReviews: 8
            };

            this.setupStatsData();
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    private async loadUsers(): Promise<void> {
        try {
            // Generate mock user data - replace with real API call
            this.users = this.generateMockUsers();
            this.calculatePagination();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    private async loadRecentActivity(): Promise<void> {
        try {
            this.recentActivity = this.generateMockActivity();
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    private async updateSystemHealth(): Promise<void> {
        try {
            // Simulate system health check
            const healthScore = Math.random() * 100;

            if (healthScore > 80) {
                this.systemHealth = 'healthy';
            } else if (healthScore > 60) {
                this.systemHealth = 'warning';
            } else {
                this.systemHealth = 'critical';
            }

            this.activeUsers = Math.floor(Math.random() * 100) + 50;
            this.pendingPayouts = Math.floor(Math.random() * 10000) + 5000;
        } catch (error) {
            console.error('Error updating system health:', error);
        }
    }

    // Setup Methods
    private setupStatsData(): void {
        this.statsData = [
            {
                id: 'users',
                title: 'Total Users',
                value: this.adminStats.totalUsers,
                icon: 'U',
                type: 'users',
                trend: 'up',
                change: 12,
                description: 'Active platform users'
            },
            {
                id: 'listings',
                title: 'Active Listings',
                value: this.adminStats.activeListings,
                icon: 'L',
                type: 'listings',
                trend: 'up',
                change: 8,
                description: 'Cars available for rent'
            },
            {
                id: 'bookings',
                title: 'Monthly Bookings',
                value: this.adminStats.monthlyBookings,
                icon: 'B',
                type: 'bookings',
                trend: 'up',
                change: 15,
                description: 'Bookings this month'
            },
            {
                id: 'revenue',
                title: 'Total Revenue',
                value: this.adminStats.totalRevenue,
                icon: 'R',
                type: 'revenue',
                trend: 'up',
                change: 22,
                description: 'Platform revenue'
            },
            {
                id: 'commission',
                title: 'Platform Commission',
                value: this.adminStats.platformCommission,
                icon: 'C',
                type: 'commission',
                trend: 'up',
                change: 18,
                description: 'Commission earned'
            },
            {
                id: 'tickets',
                title: 'Open Tickets',
                value: this.adminStats.openTickets,
                icon: 'T',
                type: 'tickets',
                trend: 'down',
                change: -5,
                description: 'Support tickets'
            }
        ];
    }

    private setupHealthMetrics(): void {
        this.healthMetrics = [
            {
                id: 'response-time',
                label: 'Response Time',
                value: '2.3s',
                percentage: 85,
                status: 'good'
            },
            {
                id: 'uptime',
                label: 'System Uptime',
                value: '99.9%',
                percentage: 99,
                status: 'good'
            },
            {
                id: 'satisfaction',
                label: 'User Satisfaction',
                value: '4.7/5',
                percentage: 94,
                status: 'good'
            },
            {
                id: 'disputes',
                label: 'Open Disputes',
                value: '3',
                percentage: 15,
                status: 'warning'
            }
        ];
    }

    private setupRecentActivity(): void {
        this.recentActivity = this.generateMockActivity();
    }

    // Data Generation Methods
    private generateMockUsers(): UserRecord[] {
        const users: UserRecord[] = [];
        const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Lisa Davis', 'Tom Wilson', 'Emma Taylor'];
        const types: ('Owner' | 'Renter')[] = ['Owner', 'Renter'];

        for (let i = 0; i < 50; i++) {
            const name = names[Math.floor(Math.random() * names.length)];
            const type = types[Math.floor(Math.random() * types.length)];

            users.push({
                id: `user-${i + 1}`,
                name: `${name} ${i + 1}`,
                email: `user${i + 1}@example.com`,
                type,
                verified: {
                    email: Math.random() > 0.2,
                    phone: Math.random() > 0.3,
                    id: Math.random() > 0.4
                },
                joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                isActive: Math.random() > 0.1,
                lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                totalBookings: Math.floor(Math.random() * 50),
                totalEarnings: Math.floor(Math.random() * 100000)
            });
        }

        return users;
    }

    private generateMockActivity(): ActivityItem[] {
        const activities: ActivityItem[] = [];
        const activityTypes = [
            { type: 'user', icon: 'U', message: 'New user registered' },
            { type: 'booking', icon: 'B', message: 'New booking created' },
            { type: 'listing', icon: 'L', message: 'New car listing added' },
            { type: 'payment', icon: 'P', message: 'Payment processed' },
            { type: 'system', icon: 'S', message: 'System maintenance completed' }
        ];

        for (let i = 0; i < 10; i++) {
            const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            activities.push({
                id: `activity-${i + 1}`,
                type: activityType.type as any,
                icon: activityType.icon,
                message: activityType.message,
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
            });
        }

        return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Public Methods
    async refreshData(): Promise<void> {
        if (this.isRefreshing) return;

        try {
            this.isRefreshing = true;
            console.log('Admin Dashboard: Refreshing data...');

            await this.loadDashboardData();
            this.showNotificationMessage('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotificationMessage('Error refreshing data', 'error');
        } finally {
            this.isRefreshing = false;
        }
    }

    async toggleUserStatus(user: UserRecord): Promise<void> {
        try {
            this.isLoading = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            user.isActive = !user.isActive;
            this.showNotificationMessage(
                `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
                'success'
            );
        } catch (error) {
            console.error('Error toggling user status:', error);
            this.showNotificationMessage('Error updating user status', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    viewUserDetails(user: UserRecord): void {
        console.log('Viewing user details:', user);
        // Implement user details modal or navigation
    }

    sendNotification(): void {
        console.log('Sending notification...');
        this.showNotificationMessage('Notification sent successfully', 'success');
    }

    generateReport(): void {
        console.log('Generating report...');
        this.showNotificationMessage('Report generated successfully', 'success');
    }

    manageListings(): void {
        console.log('Managing listings...');
        // Navigate to listings management
    }

    viewAnalytics(): void {
        console.log('Viewing analytics...');
        // Navigate to analytics page
    }

    exportData(): void {
        console.log('Exporting data...');
        this.showNotificationMessage('Data exported successfully', 'success');
    }

    // Mobile Methods
    toggleMobileMenu(): void {
        this.showMobileMenu = !this.showMobileMenu;
    }

    navigateToSection(section: string): void {
        console.log('Navigating to section:', section);
        this.showMobileMenu = false;
    }

    // Pagination Methods
    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    private calculatePagination(): void {
        this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    }

    get paginatedUsers(): UserRecord[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.users.slice(start, end);
    }

    // Utility Methods
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    }

    showNotificationMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
        this.notificationMessage = message;
        this.notificationType = type;
        this.showNotification = true;

        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    hideNotification(): void {
        this.showNotification = false;
    }

    getNotificationIcon(type: string): string {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '!',
            info: 'i'
        };
        return icons[type as keyof typeof icons] || 'i';
    }

    // TrackBy Methods
    trackByStatId(index: number, stat: StatCard): string {
        return stat.id;
    }

    trackByUserId(index: number, user: UserRecord): string {
        return user.id;
    }

    trackByActivityId(index: number, activity: ActivityItem): string {
        return activity.id;
    }

    trackByMetricId(index: number, metric: HealthMetric): string {
        return metric.id;
    }
} 

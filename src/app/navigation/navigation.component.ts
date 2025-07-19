import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Interfaces
interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: number;
  isActive?: boolean;
  isVisible: (userRole: UserRole) => boolean;
}

interface UserRole {
  type: 'guest' | 'renter' | 'owner' | 'admin';
  isAuthenticated: boolean;
  permissions: string[];
}

interface NotificationCount {
  messages: number;
  bookings: number;
  system: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isOnline: boolean;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  // Navigation State
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isSearchOpen = false;
  isScrolled = false;
  searchQuery = '';

  // Mock Authentication State
  currentUser: UserProfile | null = null;
  userRole: UserRole = {
    type: 'guest',
    isAuthenticated: false,
    permissions: []
  };

  // Mock Notification Count
  notificationCount: NotificationCount = {
    messages: 3,
    bookings: 1,
    system: 0
  };

  // Navigation Items
  primaryNavItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: '🏠',
      isVisible: () => true
    },
    {
      id: 'find-cars',
      label: 'Find Cars',
      path: '/search',
      icon: '🔍',
      isVisible: () => true
    },
    {
      id: 'list-car',
      label: 'List Your Car',
      path: '/add-car-listing',
      icon: '🚗',
      isVisible: (role) => role.isAuthenticated
    },
    {
      id: 'how-it-works',
      label: 'How It Works',
      path: '/how-it-works',
      icon: '❓',
      isVisible: () => true
    },
    {
      id: 'support',
      label: 'Support',
      path: '/support',
      icon: '💬',
      isVisible: () => true
    }
  ];

  authenticatedNavItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      isVisible: (role) => role.isAuthenticated && (role.type === 'owner' || role.type === 'admin')
    },
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      path: '/admin',
      icon: '⚙️',
      isVisible: (role) => role.isAuthenticated && role.type === 'admin'
    },
    {
      id: 'renter-dashboard',
      label: 'My Bookings',
      path: '/renter-dashboard',
      icon: '📅',
      isVisible: (role) => role.isAuthenticated && role.type === 'renter'
    },
    {
      id: 'messages',
      label: 'Messages',
      path: '/messaging',
      icon: '💬',
      badge: 3,
      isVisible: (role) => role.isAuthenticated
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: '👤',
      isVisible: (role) => role.isAuthenticated
    },
    {
      id: 'my-cars',
      label: 'My Cars',
      path: '/my-cars',
      icon: '🚙',
      isVisible: (role) => role.isAuthenticated && role.type === 'owner'
    }
  ];

  // User Menu Items
  userMenuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: '👤',
      action: () => this.navigateToProfile()
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      action: () => this.navigateToSettings()
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      action: () => this.navigateToSupport()
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      action: () => this.logout()
    }
  ];

  // Breadcrumb Items
  breadcrumbItems: NavigationItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeUserState();
    this.setupScrollListener();
    this.updateBreadcrumbs();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  private initializeUserState(): void {
    // Mock different user states for demonstration
    const userStates = [
      {
        type: 'guest' as const,
        isAuthenticated: false,
        permissions: []
      },
      {
        type: 'renter' as const,
        isAuthenticated: true,
        permissions: ['book_cars', 'view_bookings']
      },
      {
        type: 'owner' as const,
        isAuthenticated: true,
        permissions: ['list_cars', 'manage_bookings', 'view_earnings']
      },
      {
        type: 'admin' as const,
        isAuthenticated: true,
        permissions: ['admin_access', 'manage_users', 'view_reports']
      }
    ];

    // Simulate different user states (you can change this to test different scenarios)
    const currentStateIndex = 3; // Change this to test different user types (0: guest, 1: renter, 2: owner, 3: admin)
    this.userRole = userStates[currentStateIndex];

    if (this.userRole.isAuthenticated) {
      this.currentUser = {
        id: '1',
        name: 'Adebayo Johnson',
        email: 'adebayo@hiremycar.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        role: this.userRole,
        isOnline: true
      };
    }
  }

  private setupScrollListener(): void {
    // Scroll listener is handled by @HostListener
  }

  private updateBreadcrumbs(): void {
    const currentPath = this.router.url;
    this.breadcrumbItems = this.generateBreadcrumbs(currentPath);
  }

  private generateBreadcrumbs(path: string): NavigationItem[] {
    const segments = path.split('/').filter(segment => segment);
    const breadcrumbs: NavigationItem[] = [
      {
        id: 'home',
        label: 'Home',
        path: '/',
        icon: '🏠',
        isVisible: () => true
      }
    ];

    let currentPath = '';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = this.getBreadcrumbLabel(segment);
      breadcrumbs.push({
        id: segment,
        label,
        path: currentPath,
        isVisible: () => true
      });
    });

    return breadcrumbs;
  }

  private getBreadcrumbLabel(segment: string): string {
    const labelMap: { [key: string]: string } = {
      'search': 'Find Cars',
      'car': 'Car Details',
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'messaging': 'Messages',
      'renter-dashboard': 'My Bookings',
      'add-car-listing': 'List Your Car',
      'admin': 'Admin Dashboard',
      'admin-dashboard': 'Admin Dashboard'
    };
    return labelMap[segment] || `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
  }

  // Navigation Methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
      // Close other menus when mobile menu opens
      this.isUserMenuOpen = false;
      this.isSearchOpen = false;
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Close mobile menu when user menu opens
    if (this.isUserMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  closeAllMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
    this.isSearchOpen = false;
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
  }

  // Handle escape key to close menus
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen || this.isUserMenuOpen || this.isSearchOpen) {
      this.closeAllMenus();
    }
  }

  // Handle click outside to close menus
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Close user menu if clicking outside
    if (this.isUserMenuOpen && !target.closest('.user-menu-container')) {
      this.isUserMenuOpen = false;
    }
    
    // Close search if clicking outside
    if (this.isSearchOpen && !target.closest('.search-section')) {
      this.isSearchOpen = false;
    }
  }

  // User Actions
  login(): void {
    // Simulate login
    this.userRole = {
      type: 'renter',
      isAuthenticated: true,
      permissions: ['book_cars', 'view_bookings']
    };
    this.currentUser = {
      id: '1',
      name: 'Adebayo Johnson',
      email: 'adebayo@hiremycar.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: this.userRole,
      isOnline: true
    };
    this.showNotification('Welcome back, Adebayo!', 'success');
  }

  logout(): void {
    this.userRole = {
      type: 'guest',
      isAuthenticated: false,
      permissions: []
    };
    this.currentUser = null;
    this.closeAllMenus();
    this.router.navigate(['/']);
    this.showNotification('You have been logged out successfully', 'info');
  }

  // Navigation Methods
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeAllMenus();
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.closeAllMenus();
  }

  navigateToSupport(): void {
    this.router.navigate(['/support']);
    this.closeAllMenus();
  }

  // Search Methods
  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.searchQuery = '';
      this.isSearchOpen = false;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearchOpen = false;
  }

  // Utility Methods
  getVisibleNavItems(items: NavigationItem[]): NavigationItem[] {
    return items.filter(item => item.isVisible(this.userRole));
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
  }

  getTotalNotifications(): number {
    return this.notificationCount.messages + this.notificationCount.bookings + this.notificationCount.system;
  }

  getUserDisplayName(): string {
    if (!this.currentUser) {
      return '';
    }
    return this.currentUser.name.split(' ')[0]; // Return first name only
  }

  getUserRoleLabel(): string {
    switch (this.userRole.type) {
      case 'renter': {
        return 'Renter';
      }
      case 'owner': {
        return 'Car Owner';
      }
      case 'admin': {
        return 'Administrator';
      }
      default: {
        return 'Guest';
      }
    }
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // In a real app, you'd use a notification service
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Track by functions for ngFor
  trackByNavItemId(index: number, item: NavigationItem): string {
    return item.id;
  }

  trackByMenuItemId(index: number, item: any): string {
    return item.id;
  }
} 
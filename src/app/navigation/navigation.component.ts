import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserProfile, AuthState } from '../interfaces/auth.interface';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';

// Interfaces
interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: number;
  isActive?: boolean;
  isVisible: (authState: AuthState) => boolean;
}

interface NotificationCount {
  messages: number;
  bookings: number;
  system: number;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoginModalComponent, SignupModalComponent],
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

  // Authentication State
  authState: AuthState = {
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false
  };

  // Modal State
  showLoginModal = false;
  showSignupModal = false;

  // Mock Notification Count
  notificationCount: NotificationCount = {
    messages: 3,
    bookings: 1,
    system: 0
  };

  private destroy$ = new Subject<void>();

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
      icon: '📝',
      isVisible: (authState) => authState.isAuthenticated
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
      isVisible: (authState) => authState.isAuthenticated && (authState.profile?.user_type === 'owner' || authState.profile?.user_type === 'admin')
    },
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      path: '/admin',
      icon: '⚙️',
      isVisible: (authState) => authState.isAuthenticated && authState.profile?.user_type === 'admin'
    },
    {
      id: 'renter-dashboard',
      label: 'My Bookings',
      path: '/renter-dashboard',
      icon: '📅',
      isVisible: (authState) => authState.isAuthenticated && authState.profile?.user_type === 'renter'
    },
    {
      id: 'messages',
      label: 'Messages',
      path: '/messaging',
      icon: '💬',
      badge: 3,
      isVisible: (authState) => authState.isAuthenticated
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: '👤',
      isVisible: (authState) => authState.isAuthenticated
    },
    {
      id: 'my-cars',
      label: 'My Cars',
      path: '/my-cars',
      icon: '🚙',
      isVisible: (authState) => authState.isAuthenticated && authState.profile?.user_type === 'owner'
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

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeAuthState();
    this.setupScrollListener();
    this.updateBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  private initializeAuthState(): void {
    // Subscribe to auth state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.authState = authState;
      });
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
    console.log('Navigation: Login button clicked');
    console.log('Navigation: Setting showLoginModal to true');
    this.showLoginModal = true;
    console.log('Navigation: showLoginModal is now:', this.showLoginModal);
  }

  signup(): void {
    this.showSignupModal = true;
  }

  logout(): void {
    this.authService.signOut();
    this.closeAllMenus();
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  closeSignupModal(): void {
    this.showSignupModal = false;
  }

  switchToSignup(): void {
    this.showLoginModal = false;
    this.showSignupModal = true;
  }

  switchToLogin(): void {
    this.showSignupModal = false;
    this.showLoginModal = true;
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
    return items.filter(item => item.isVisible(this.authState));
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
  }

  getTotalNotifications(): number {
    return this.notificationCount.messages + this.notificationCount.bookings + this.notificationCount.system;
  }

  getUserDisplayName(): string {
    return this.authService.getUserDisplayName();
  }

  getUserRoleLabel(): string {
    return this.authService.getUserRoleLabel();
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
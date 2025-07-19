import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaces
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

interface VerificationStatus {
  driverLicenseUploaded: boolean;
  idPhotoUploaded: boolean;
  ninVerified: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  profileVisible: boolean;
  twoFactorAuth: boolean;
}

interface CarOwnerStats {
  hostRating: number;
  responseRate: number;
  totalCarsListed: number;
  totalEarnings: number;
}

interface RenterStats {
  renterRating: number;
  tripsCompleted: number;
  favoriteLocations: string[];
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'message' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
  amount?: number;
  rating?: number;
}

interface NigerianState {
  code: string;
  name: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  // User Profile Data
  userProfile: UserProfile = {
    id: '1',
    fullName: 'Adebayo Johnson',
    email: 'adebayo.johnson@email.com',
    phone: '+234 801 234 5678',
    location: 'Lagos',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Experienced car owner and host on HireMyCar. I love sharing my vehicles with responsible renters.',
    isCarOwner: true,
    isVerifiedEmail: true,
    isVerifiedPhone: true,
    memberSince: new Date('2023-06-15'),
    profileCompletion: 85
  };

  // Verification Status
  verificationStatus: VerificationStatus = {
    driverLicenseUploaded: true,
    idPhotoUploaded: true,
    ninVerified: true
  };

  // Notification Settings
  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    profileVisible: true,
    twoFactorAuth: false
  };

  // Car Owner Stats (conditional)
  carOwnerStats: CarOwnerStats = {
    hostRating: 4.8,
    responseRate: 95,
    totalCarsListed: 3,
    totalEarnings: 450000
  };

  // Renter Stats (conditional)
  renterStats: RenterStats = {
    renterRating: 4.9,
    tripsCompleted: 12,
    favoriteLocations: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano']
  };

  // Recent Activities
  recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'booking',
      title: 'Toyota Camry 2023',
      description: 'Booking confirmed for Feb 15-18',
      timestamp: new Date('2024-02-10 14:30'),
      status: 'Confirmed',
      amount: 75000
    },
    {
      id: '2',
      type: 'message',
      title: 'Sarah Okonkwo',
      description: 'Hi, is the car available for pickup at 2 PM?',
      timestamp: new Date('2024-02-09 16:45')
    },
    {
      id: '3',
      type: 'review',
      title: 'BMW 3 Series',
      description: 'Excellent service and clean car!',
      timestamp: new Date('2024-02-08 11:20'),
      rating: 5
    },
    {
      id: '4',
      type: 'booking',
      title: 'Honda Civic 2022',
      description: 'Booking completed for Jan 20-22',
      timestamp: new Date('2024-01-22 18:15'),
      status: 'Completed',
      amount: 66000
    },
    {
      id: '5',
      type: 'message',
      title: 'Michael Adebayo',
      description: 'Thank you for the smooth rental experience!',
      timestamp: new Date('2024-01-21 10:30')
    }
  ];

  // Nigerian States
  nigerianStates: NigerianState[] = [
    { code: 'ABJ', name: 'Abuja' },
    { code: 'LAG', name: 'Lagos' },
    { code: 'KAN', name: 'Kano' },
    { code: 'KAD', name: 'Kaduna' },
    { code: 'KAT', name: 'Katsina' },
    { code: 'KOG', name: 'Kogi' },
    { code: 'KWA', name: 'Kwara' },
    { code: 'NAS', name: 'Nasarawa' },
    { code: 'NIG', name: 'Niger' },
    { code: 'OGU', name: 'Ogun' },
    { code: 'OND', name: 'Ondo' },
    { code: 'OSU', name: 'Osun' },
    { code: 'OYO', name: 'Oyo' },
    { code: 'PLA', name: 'Plateau' },
    { code: 'RIV', name: 'Rivers' },
    { code: 'SOK', name: 'Sokoto' },
    { code: 'TAR', name: 'Taraba' },
    { code: 'YOB', name: 'Yobe' },
    { code: 'ZAM', name: 'Zamfara' },
    { code: 'ABI', name: 'Abia' },
    { code: 'ADM', name: 'Adamawa' },
    { code: 'AKW', name: 'Akwa Ibom' },
    { code: 'ANA', name: 'Anambra' },
    { code: 'BAU', name: 'Bauchi' },
    { code: 'BAY', name: 'Bayelsa' },
    { code: 'BEN', name: 'Benue' },
    { code: 'BOR', name: 'Borno' },
    { code: 'CRO', name: 'Cross River' },
    { code: 'DEL', name: 'Delta' },
    { code: 'EBO', name: 'Ebonyi' },
    { code: 'EDO', name: 'Edo' },
    { code: 'EKI', name: 'Ekiti' },
    { code: 'ENU', name: 'Enugu' },
    { code: 'GOM', name: 'Gombe' },
    { code: 'IMO', name: 'Imo' },
    { code: 'JIG', name: 'Jigawa' },
    { code: 'KEB', name: 'Kebbi' },
    { code: 'KER', name: 'Kebbi' }
  ];

  // Component State
  isEditing = false;
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';
  selectedFile: File | null = null;
  avatarPreview: string | null = null;
  showAdvancedSections = false;

  // Form Data
  originalProfile: UserProfile | null = null;
  editedProfile: UserProfile | null = null;

  // Phone validation
  phoneError = '';
  emailError = '';

  // Math for template
  Math = Math;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeProfile();
    this.calculateProfileCompletion();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeProfile(): void {
    this.originalProfile = { ...this.userProfile };
    this.editedProfile = { ...this.userProfile };
  }

  private calculateProfileCompletion(): void {
    let completedFields = 0;
    const totalFields = 8; // fullName, email, phone, location, bio, avatar, driverLicense, idPhoto

    if (this.userProfile.fullName) completedFields++;
    if (this.userProfile.email) completedFields++;
    if (this.userProfile.phone) completedFields++;
    if (this.userProfile.location) completedFields++;
    if (this.userProfile.bio) completedFields++;
    if (this.userProfile.avatarUrl) completedFields++;
    if (this.verificationStatus.driverLicenseUploaded) completedFields++;
    if (this.verificationStatus.idPhotoUploaded) completedFields++;

    this.userProfile.profileCompletion = Math.round((completedFields / totalFields) * 100);
  }

  // Profile Editing
  startEditing(): void {
    this.isEditing = true;
    this.editedProfile = { ...this.userProfile };
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editedProfile = null;
    this.phoneError = '';
    this.emailError = '';
  }

  saveProfile(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      if (this.editedProfile) {
        this.userProfile = { ...this.editedProfile };
        this.originalProfile = { ...this.userProfile };
        this.calculateProfileCompletion();
      }

      this.isEditing = false;
      this.editedProfile = null;
      this.isLoading = false;
      this.showNotificationMessage('Profile updated successfully!', 'success');
    }, 1500);
  }

  private validateForm(): boolean {
    let isValid = true;
    this.phoneError = '';
    this.emailError = '';

    if (!this.editedProfile) return false;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editedProfile.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation (Nigerian format)
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(this.editedProfile.phone.replace(/\s/g, ''))) {
      this.phoneError = 'Please enter a valid Nigerian phone number';
      isValid = false;
    }

    return isValid;
  }

  // Avatar Upload
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(): void {
    if (this.selectedFile && this.avatarPreview) {
      this.isLoading = true;
      
      // Simulate upload
      setTimeout(() => {
        this.userProfile.avatarUrl = this.avatarPreview!;
        this.selectedFile = null;
        this.avatarPreview = null;
        this.isLoading = false;
        this.calculateProfileCompletion();
        this.showNotificationMessage('Avatar updated successfully!', 'success');
      }, 1000);
    }
  }

  // Document Upload
  uploadDocument(type: 'driverLicense' | 'idPhoto'): void {
    this.isLoading = true;
    
    // Simulate upload
    setTimeout(() => {
      if (type === 'driverLicense') {
        this.verificationStatus.driverLicenseUploaded = true;
      } else {
        this.verificationStatus.idPhotoUploaded = true;
      }
      
      this.calculateProfileCompletion();
      this.isLoading = false;
      this.showNotificationMessage(`${type === 'driverLicense' ? 'Driver\'s License' : 'ID Photo'} uploaded successfully!`, 'success');
    }, 1500);
  }

  // Settings Toggle
  toggleSetting(setting: keyof NotificationSettings): void {
    this.notificationSettings[setting] = !this.notificationSettings[setting];
    this.showNotificationMessage(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${this.notificationSettings[setting] ? 'enabled' : 'disabled'}`, 'info');
  }

  // Notification System
  showNotificationMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  // Utility Methods
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'booking': return '📅';
      case 'message': return '💬';
      case 'review': return '⭐';
      default: return '📋';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Confirmed': return '#16a34a';
      case 'Completed': return '#2563eb';
      case 'Cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getVerificationColor(verified: boolean): string {
    return verified ? '#16a34a' : '#dc2626';
  }

  getProfileCompletionColor(): string {
    if (this.userProfile.profileCompletion >= 80) return '#16a34a';
    if (this.userProfile.profileCompletion >= 60) return '#eab308';
    return '#dc2626';
  }

  getMissingFields(): string[] {
    const missing: string[] = [];
    
    if (!this.userProfile.bio) missing.push('Add Bio');
    if (!this.verificationStatus.driverLicenseUploaded) missing.push('Upload Driver\'s License');
    if (!this.verificationStatus.idPhotoUploaded) missing.push('Upload ID Photo');
    if (!this.verificationStatus.ninVerified) missing.push('Verify NIN');
    
    return missing;
  }

  // Navigation
  navigateToDashboard(): void {
    if (this.userProfile.isCarOwner) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/renter-dashboard']);
    }
  }

  // Track by functions for ngFor
  trackByActivityId(index: number, activity: RecentActivity): string {
    return activity.id;
  }

  trackByStateCode(index: number, state: NigerianState): string {
    return state.code;
  }
} 
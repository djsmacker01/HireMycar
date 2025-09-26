import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserProfile as AuthUserProfile } from '../interfaces/auth.interface';

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
  // User Profile Data - will be populated from AuthService
  userProfile: UserProfile | null = null;
  authProfile: AuthUserProfile | null = null;

  // Verification Status - Real data from database
  verificationStatus: VerificationStatus = {
    driverLicenseUploaded: false,
    idPhotoUploaded: false,
    ninVerified: false
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

  // Recent Activities - will be populated with real data
  recentActivities: RecentActivity[] = [];

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

  // Document Upload Properties
  selectedDriverLicense: File | null = null;
  selectedIdPhoto: File | null = null;
  selectedNinDocument: File | null = null;
  driverLicensePreview: string | null = null;
  idPhotoPreview: string | null = null;
  ninDocumentPreview: string | null = null;
  isUploadingDocument = false;

  // Math for template
  Math = Math;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadUserProfile(): void {
    console.log('Loading user profile...');
    // Get user profile from AuthService
    this.authProfile = this.authService.currentProfile();
    console.log('Current auth profile:', this.authProfile);

    // If no profile is loaded, try to get it from the auth state
    if (!this.authProfile) {
      console.log('No profile found, subscribing to auth state...');
      this.authService.authState$.subscribe(authState => {
        console.log('Auth state changed:', authState);
        this.authProfile = authState.profile;
        this.mapAuthProfileToUserProfile();
      });
    } else {
      console.log('Profile found, mapping to user profile...');
      this.mapAuthProfileToUserProfile();
    }

    // Add a timeout to show fallback data if profile doesn't load
    setTimeout(() => {
      if (!this.userProfile) {
        console.log('Profile not loaded after timeout, showing fallback data');
        this.createFallbackProfile();
      }
    }, 3000);
  }

  private mapAuthProfileToUserProfile(): void {
    if (this.authProfile) {
      console.log('Mapping auth profile to user profile:', this.authProfile);
      console.log('Auth profile is_verified:', this.authProfile.is_verified);
      console.log('Auth profile phone_number:', this.authProfile.phone_number);
      console.log('Auth profile email:', this.authProfile.email);
      console.log('Auth profile bio:', this.authProfile.bio);

      this.userProfile = {
        id: this.authProfile.id,
        fullName: this.authProfile.full_name,
        email: this.authProfile.email,
        phone: this.authProfile.phone_number || '',
        location: this.authProfile.city || this.authProfile.state || '',
        avatarUrl: this.authProfile.avatar_url || '',
        bio: this.authProfile.bio || '',
        isCarOwner: this.authProfile.user_type === 'owner',
        isVerifiedEmail: this.authProfile.is_verified === true,
        isVerifiedPhone: this.authProfile.phone_number ? true : false,
        memberSince: new Date(this.authProfile.created_at),
        profileCompletion: this.calculateProfileCompletionFromAuth()
      };
      console.log('Mapped user profile:', this.userProfile);
      console.log('Mapped isVerifiedEmail:', this.userProfile.isVerifiedEmail);
      console.log('Mapped isVerifiedPhone:', this.userProfile.isVerifiedPhone);

      // Initialize profile data after user profile is loaded
      this.initializeProfile();
      this.calculateProfileCompletion();
    } else {
      console.log('No auth profile to map');
    }
  }

  private calculateProfileCompletionFromAuth(): number {
    if (!this.authProfile) return 0;

    let completion = 0;
    const fields = [
      this.authProfile.full_name,
      this.authProfile.email,
      this.authProfile.phone_number,
      this.authProfile.address,
      this.authProfile.city,
      this.authProfile.state,
      this.authProfile.avatar_url
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private createFallbackProfile(): void {
    console.log('Creating fallback profile...');
    // Get current user from auth service
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.userProfile = {
        id: currentUser.id,
        fullName: currentUser.user_metadata?.['full_name'] || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || '',
        phone: currentUser.user_metadata?.['phone_number'] || '',
        location: currentUser.user_metadata?.['city'] || currentUser.user_metadata?.['state'] || '',
        avatarUrl: currentUser.user_metadata?.['avatar_url'] || '',
        bio: '',
        isCarOwner: currentUser.user_metadata?.['user_type'] === 'owner',
        isVerifiedEmail: currentUser.email_confirmed_at ? true : false,
        isVerifiedPhone: false,
        memberSince: new Date(currentUser.created_at),
        profileCompletion: 50
      };
      console.log('Created fallback profile:', this.userProfile);

      // Initialize profile data
      this.initializeProfile();
      this.calculateProfileCompletion();
    }
  }

  private async refreshAuthProfile(): Promise<void> {
    try {
      console.log('Refreshing auth profile...');
      // Reload the profile from the database
      this.authProfile = this.authService.currentProfile();
      if (this.authProfile) {
        this.mapAuthProfileToUserProfile();
      }
    } catch (error) {
      console.error('Error refreshing auth profile:', error);
    }
  }

  private async createProfileIfNotExists(): Promise<void> {
    try {
      console.log('Creating profile if not exists...');
      const result = await this.authService.createProfileIfNotExists();
      console.log('Create profile result:', result);

      if (result.success) {
        console.log('Profile created successfully');
        // Refresh the auth profile after creation
        await this.refreshAuthProfile();
      } else {
        console.error('Failed to create profile:', result.error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }

  private initializeProfile(): void {
    if (this.userProfile) {
      this.originalProfile = { ...this.userProfile };
      this.editedProfile = { ...this.userProfile };
    }
  }

  private calculateProfileCompletion(): void {
    if (!this.userProfile) return;

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
    console.log('Profile completion calculated:', {
      completedFields,
      totalFields,
      percentage: this.userProfile.profileCompletion,
      userProfile: this.userProfile
    });
  }

  // Profile Editing
  startEditing(): void {
    if (this.userProfile) {
      this.isEditing = true;
      this.editedProfile = { ...this.userProfile };
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editedProfile = null;
    this.phoneError = '';
    this.emailError = '';
  }

  async saveProfile(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    try {
      if (this.editedProfile && this.authProfile) {
        // Update the profile in the database
        const updateData: any = {
          full_name: this.editedProfile.fullName,
          phone_number: this.editedProfile.phone,
          city: this.editedProfile.location,
          avatar_url: this.editedProfile.avatarUrl,
          updated_at: new Date().toISOString()
        };

        // Add bio field (now that column exists in database)
        updateData.bio = this.editedProfile.bio || '';

        console.log('Updating profile with data:', updateData);
        console.log('Current auth profile:', this.authProfile);
        console.log('Edited profile data:', this.editedProfile);
        console.log('Bio being saved:', this.editedProfile.bio);

        // Use AuthService to update profile
        const result = await this.authService.updateProfile(updateData);
        console.log('Update profile result:', result);

        if (result.success) {
          // Update local profile
          this.userProfile = { ...this.editedProfile };
          this.originalProfile = { ...this.userProfile };
          this.calculateProfileCompletion();

          // Note: Bio is stored locally since it's not in the database schema yet
          console.log('Bio stored locally:', this.editedProfile.bio);

          // Refresh the auth profile to get updated data
          await this.refreshAuthProfile();

          this.isEditing = false;
          this.editedProfile = null;
          this.showNotificationMessage('Profile updated successfully!', 'success');
        } else {
          console.error('Profile update failed:', result.error);

          // If the profile doesn't exist, try to create it first
          if (result.error?.message?.includes('No user profile found') || result.error?.message?.includes('not found')) {
            console.log('Profile not found, attempting to create profile first...');
            await this.createProfileIfNotExists();

            // Try updating again
            const retryResult = await this.authService.updateProfile(updateData);
            console.log('Retry update profile result:', retryResult);

            if (retryResult.success) {
              // Update local profile
              this.userProfile = { ...this.editedProfile };
              this.originalProfile = { ...this.userProfile };
              this.calculateProfileCompletion();

              // Refresh the auth profile to get updated data
              await this.refreshAuthProfile();

              this.isEditing = false;
              this.editedProfile = null;
              this.showNotificationMessage('Profile updated successfully!', 'success');
            } else {
              this.showNotificationMessage(`Failed to update profile: ${retryResult.error?.message || 'Unknown error'}. Please try again.`, 'error');
            }
          } else {
            this.showNotificationMessage(`Failed to update profile: ${result.error?.message || 'Unknown error'}. Please try again.`, 'error');
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      this.showNotificationMessage('Failed to update profile. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
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
    console.log('File selected:', event);
    const file = event.target.files[0];
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
        console.log('Avatar preview set:', this.avatarPreview);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  }

  uploadAvatar(): void {
    console.log('Upload avatar called:', {
      selectedFile: this.selectedFile,
      avatarPreview: this.avatarPreview,
      isEditing: this.isEditing
    });

    if (this.selectedFile && this.avatarPreview) {
      this.isLoading = true;

      // Simulate upload
      setTimeout(() => {
        if (this.userProfile) {
          this.userProfile.avatarUrl = this.avatarPreview!;
          console.log('Avatar URL updated:', this.userProfile.avatarUrl);
        }
        this.selectedFile = null;
        this.avatarPreview = null;
        this.isLoading = false;
        this.calculateProfileCompletion();
        this.showNotificationMessage('Avatar updated successfully!', 'success');
      }, 1000);
    } else {
      console.log('Cannot upload avatar - missing file or preview');
    }
  }

  // Document Upload - File Selection
  onDocumentSelected(event: any, type: 'driverLicense' | 'idPhoto' | 'ninDocument'): void {
    const file = event.target.files[0];
    if (file) {
      console.log(`${type} file selected:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validate file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.showNotificationMessage('Please upload an image (JPG, PNG, GIF) or PDF file.', 'error');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showNotificationMessage('File size must be less than 5MB.', 'error');
        return;
      }

      // Store the file and create preview
      if (type === 'driverLicense') {
        this.selectedDriverLicense = file;
        this.createDocumentPreview(file, 'driverLicense');
      } else if (type === 'idPhoto') {
        this.selectedIdPhoto = file;
        this.createDocumentPreview(file, 'idPhoto');
      } else if (type === 'ninDocument') {
        this.selectedNinDocument = file;
        this.createDocumentPreview(file, 'ninDocument');
      }
    }
  }

  // Create document preview
  private createDocumentPreview(file: File, type: 'driverLicense' | 'idPhoto' | 'ninDocument'): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'driverLicense') {
        this.driverLicensePreview = e.target.result;
      } else if (type === 'idPhoto') {
        this.idPhotoPreview = e.target.result;
      } else if (type === 'ninDocument') {
        this.ninDocumentPreview = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  // Upload document to server
  async uploadDocument(type: 'driverLicense' | 'idPhoto' | 'ninDocument'): Promise<void> {
    let file: File | null = null;

    if (type === 'driverLicense') {
      file = this.selectedDriverLicense;
    } else if (type === 'idPhoto') {
      file = this.selectedIdPhoto;
    } else if (type === 'ninDocument') {
      file = this.selectedNinDocument;
    }

    if (!file) {
      this.showNotificationMessage('Please select a file first.', 'error');
      return;
    }

    this.isUploadingDocument = true;

    try {
      // TODO: Implement actual file upload to Supabase Storage
      // For now, simulate upload
      console.log(`Uploading ${type}:`, file);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update verification status
      if (type === 'driverLicense') {
        this.verificationStatus.driverLicenseUploaded = true;
      } else if (type === 'idPhoto') {
        this.verificationStatus.idPhotoUploaded = true;
      } else if (type === 'ninDocument') {
        this.verificationStatus.ninVerified = true;
      }

      // Clear file selection
      this.clearDocumentSelection(type);

      this.calculateProfileCompletion();
      this.showNotificationMessage(`${this.getDocumentDisplayName(type)} uploaded successfully! Awaiting verification.`, 'success');

    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      this.showNotificationMessage(`Failed to upload ${this.getDocumentDisplayName(type)}. Please try again.`, 'error');
    } finally {
      this.isUploadingDocument = false;
    }
  }

  // Clear document selection
  private clearDocumentSelection(type: 'driverLicense' | 'idPhoto' | 'ninDocument'): void {
    if (type === 'driverLicense') {
      this.selectedDriverLicense = null;
      this.driverLicensePreview = null;
    } else if (type === 'idPhoto') {
      this.selectedIdPhoto = null;
      this.idPhotoPreview = null;
    } else if (type === 'ninDocument') {
      this.selectedNinDocument = null;
      this.ninDocumentPreview = null;
    }
  }

  // Get document display name
  private getDocumentDisplayName(type: 'driverLicense' | 'idPhoto' | 'ninDocument'): string {
    switch (type) {
      case 'driverLicense': return "Driver's License";
      case 'idPhoto': return 'ID Photo';
      case 'ninDocument': return 'NIN Document';
      default: return 'Document';
    }
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
    if (!this.userProfile) return '#dc2626';
    if (this.userProfile.profileCompletion >= 80) return '#16a34a';
    if (this.userProfile.profileCompletion >= 60) return '#eab308';
    return '#dc2626';
  }

  getMissingFields(): string[] {
    const missing: string[] = [];

    if (!this.userProfile) return missing;

    if (!this.userProfile.bio) missing.push('Add Bio');
    if (!this.verificationStatus.driverLicenseUploaded) missing.push('Upload Driver\'s License');
    if (!this.verificationStatus.idPhotoUploaded) missing.push('Upload ID Photo');
    if (!this.verificationStatus.ninVerified) missing.push('Verify NIN');

    return missing;
  }

  // Navigation
  navigateToDashboard(): void {
    if (!this.userProfile) return;

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
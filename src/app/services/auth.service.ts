import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import {
  UserProfile,
  AuthState,
  SignupData,
  LoginData,
  AuthError
} from '../interfaces/auth.interface';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Signals for reactive state management
  public authState = signal<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false
  });

  public isAuthenticated = computed(() => this.authState().isAuthenticated);
  public currentUser = computed(() => this.authState().user);
  public currentProfile = computed(() => this.authState().profile);
  public isLoading = computed(() => this.authState().isLoading);

  // Debug method to check authentication status
  public debugAuthStatus(): void {
    console.log('=== AUTH DEBUG ===');
    console.log('Auth State:', this.authState());
    console.log('Is Authenticated:', this.isAuthenticated);
    console.log('Current User:', this.currentUser);
    console.log('Current Profile:', this.currentProfile);
    console.log('Is Loading:', this.isLoading);
    console.log('==================');
  }

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Get initial session
      const { data: { session }, error } = await this.supabase.client.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        this.updateAuthState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
        return;
      }

      if (session?.user) {
        await this.loadUserProfile(session.user);
      } else {
        this.updateAuthState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
      }

      // Listen for auth changes
      this.supabase.client.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (session?.user) {
          await this.loadUserProfile(session.user);
        } else {
          this.updateAuthState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.updateAuthState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
    }
  }

  private async loadUserProfile(user: User): Promise<void> {
    try {
      const { data: profile, error } = await this.supabase.client
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // If profile doesn't exist, create a basic one
        await this.createUserProfile(user);
        return;
      }

      this.updateAuthState({
        user,
        profile,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      this.updateAuthState({ user, profile: null, isLoading: false, isAuthenticated: false });
    }
  }

  private async createUserProfile(user: User): Promise<void> {
    try {
      const newProfile: Partial<UserProfile> = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.['full_name'] || user.email!.split('@')[0],
        avatar_url: user.user_metadata?.['avatar_url'],
        user_type: 'renter', // Default type
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase.client
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return;
      }

      this.updateAuthState({
        user,
        profile: data,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  }

  private updateAuthState(newState: AuthState): void {
    this.authState.set(newState);
    this.authStateSubject.next(newState);
  }

  // Public methods
  async signUp(signupData: SignupData): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.updateAuthState({ ...this.authState(), isLoading: true });

      const { data, error } = await this.supabase.client.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            user_type: signupData.user_type
          }
        }
      });

      if (error) {
        this.updateAuthState({ ...this.authState(), isLoading: false });
        return { success: false, error: { message: error.message, code: error.message } };
      }

      if (data.user) {
        // Create user profile
        const profileData: Partial<UserProfile> = {
          id: data.user.id,
          email: signupData.email,
          full_name: signupData.full_name,
          user_type: signupData.user_type,
          phone_number: signupData.phone_number,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await this.supabase.client
          .from('user_profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // If email confirmation is required, don't update auth state yet
        if (data.user && !data.user.email_confirmed_at) {
          this.updateAuthState({ ...this.authState(), isLoading: false });
          return { success: true };
        }
      }

      this.updateAuthState({ ...this.authState(), isLoading: false });
      return { success: true };
    } catch (error: any) {
      this.updateAuthState({ ...this.authState(), isLoading: false });
      return { success: false, error: { message: error.message || 'An unexpected error occurred' } };
    }
  }

  async signIn(loginData: LoginData): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.updateAuthState({ ...this.authState(), isLoading: true });

      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        this.updateAuthState({ ...this.authState(), isLoading: false });
        return { success: false, error: { message: error.message, code: error.message } };
      }

      // The auth state change listener will handle loading the profile
      return { success: true };
    } catch (error: any) {
      this.updateAuthState({ ...this.authState(), isLoading: false });
      return { success: false, error: { message: error.message || 'An unexpected error occurred' } };
    }
  }

  async signInWithGoogle(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      this.updateAuthState({ ...this.authState(), isLoading: true });

      const { data, error } = await this.supabase.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        this.updateAuthState({ ...this.authState(), isLoading: false });
        return { success: false, error: { message: error.message, code: error.message } };
      }

      return { success: true };
    } catch (error: any) {
      this.updateAuthState({ ...this.authState(), isLoading: false });
      return { success: false, error: { message: error.message || 'An unexpected error occurred' } };
    }
  }

  async signOut(): Promise<void> {
    try {
      this.updateAuthState({ ...this.authState(), isLoading: true });

      const { error } = await this.supabase.client.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
      }

      this.updateAuthState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error in signOut:', error);
      this.updateAuthState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
    }
  }

  // Email verification methods
  async sendEmailVerification(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const { error } = await this.supabase.client.auth.resend({
        type: 'signup',
        email: this.getUserEmail() || ''
      });

      if (error) {
        return { success: false, error: { message: error.message, code: error.message } };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message || 'Failed to send verification email' } };
    }
  }

  async verifyEmail(token: string, type: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const { data, error } = await this.supabase.client.auth.verifyOtp({
        token_hash: token,
        type: type as any
      });

      if (error) {
        return { success: false, error: { message: error.message, code: error.message } };
      }

      if (data.user) {
        await this.loadUserProfile(data.user);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message || 'Email verification failed' } };
    }
  }

  // Password reset methods
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: { message: error.message, code: error.message } };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message || 'Failed to send password reset email' } };
    }
  }

  async resetPassword(newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const { error } = await this.supabase.client.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: { message: error.message, code: error.message } };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message || 'Password reset failed' } };
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await this.supabase.client.auth.signInWithPassword({
        email: this.getUserEmail() || '',
        password: currentPassword
      });

      if (signInError) {
        return { success: false, error: { message: 'Current password is incorrect' } };
      }

      // Update to new password
      const { error } = await this.supabase.client.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: { message: error.message, code: error.message } };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message || 'Password update failed' } };
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const currentProfile = this.currentProfile();
      if (!currentProfile) {
        return { success: false, error: { message: 'No user profile found' } };
      }

      const { data, error } = await this.supabase.client
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', currentProfile.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: { message: error.message, code: error.message } };
      }

      // Update the auth state with the new profile
      this.updateAuthState({
        ...this.authState(),
        profile: data
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message || 'An unexpected error occurred' } };
    }
  }

  async createProfileIfNotExists(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const user = this.currentUser();
      if (!user) {
        return { success: false, error: { message: 'No user found' } };
      }

      // Check if profile already exists
      const existingProfile = this.currentProfile();
      if (existingProfile) {
        return { success: true }; // Profile already exists
      }

      // Create new profile
      await this.createUserProfile(user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message || 'Failed to create profile' } };
    }
  }

  // Observable for components that need to subscribe to auth state
  get authState$(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }

  // Helper methods
  hasRole(role: 'renter' | 'owner' | 'admin'): boolean {
    const profile = this.currentProfile();
    return profile?.user_type === role;
  }

  isOwner(): boolean {
    return this.hasRole('owner');
  }

  isRenter(): boolean {
    return this.hasRole('renter');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  getUserId(): string | null {
    return this.currentUser()?.id || null;
  }

  getUserEmail(): string | null {
    return this.currentUser()?.email || null;
  }

  getUserDisplayName(): string {
    const profile = this.currentProfile();
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0]; // Return first name
    }
    return this.getUserEmail()?.split('@')[0] || 'User';
  }

  getUserRoleLabel(): string {
    const profile = this.currentProfile();
    switch (profile?.user_type) {
      case 'renter':
        return 'Renter';
      case 'owner':
        return 'Car Owner';
      case 'admin':
        return 'Administrator';
      default:
        return 'Guest';
    }
  }

  needsEmailVerification(): boolean {
    const user = this.currentUser();
    return !!(user && !user.email_confirmed_at);
  }

  needsProfileSetup(): boolean {
    const profile = this.currentProfile();
    return !!(profile && (!profile.phone_number || !profile.full_name));
  }
}
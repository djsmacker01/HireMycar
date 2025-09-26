import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SimpleAuthState {
    isAuthenticated: boolean;
    user: any;
    profile: any;
    isLoading: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SimpleAuthService {
    private authState = new BehaviorSubject<SimpleAuthState>({
        isAuthenticated: false,
        user: null,
        profile: null,
        isLoading: true
    });

    public authState$ = this.authState.asObservable();

    constructor(
        private supabase: SupabaseService,
        private router: Router
    ) {
        console.log('SimpleAuth: Service constructor called');
        console.log('SimpleAuth: Supabase service:', this.supabase);
        this.initializeAuth();
    }

    private async initializeAuth(): Promise<void> {
        try {
            console.log('SimpleAuth: Initializing authentication...');

            // Test Supabase connection first
            console.log('SimpleAuth: Testing Supabase connection...');
            const { data: testData, error: testError } = await this.supabase.client
                .from('user_profiles')
                .select('count')
                .limit(1);

            if (testError) {
                console.error('SimpleAuth: Supabase connection test failed:', testError);
            } else {
                console.log('SimpleAuth: Supabase connection test successful');
            }

            // Get current session
            const { data: { session }, error } = await this.supabase.client.auth.getSession();

            if (error) {
                console.error('SimpleAuth: Error getting session:', error);
                this.updateAuthState({ isAuthenticated: false, user: null, profile: null, isLoading: false });
                return;
            }

            if (session?.user) {
                console.log('SimpleAuth: User found in session:', session.user.email);
                await this.loadUserProfile(session.user);
            } else {
                console.log('SimpleAuth: No user in session');
                this.updateAuthState({ isAuthenticated: false, user: null, profile: null, isLoading: false });
            }

            // Listen for auth changes
            this.supabase.client.auth.onAuthStateChange(async (event, session) => {
                console.log('SimpleAuth: Auth state changed:', event, session?.user?.email);

                if (session?.user) {
                    await this.loadUserProfile(session.user);
                } else {
                    this.updateAuthState({ isAuthenticated: false, user: null, profile: null, isLoading: false });
                }
            });

        } catch (error) {
            console.error('SimpleAuth: Error initializing auth:', error);
            this.updateAuthState({ isAuthenticated: false, user: null, profile: null, isLoading: false });
        }
    }

    private async loadUserProfile(user: any): Promise<void> {
        try {
            console.log('SimpleAuth: Loading user profile for:', user.email);

            // Try to get user profile
            const { data: profile, error } = await this.supabase.client
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.log('SimpleAuth: Profile not found, creating one...');
                // Create a basic profile if it doesn't exist
                const newProfile = {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'User',
                    user_type: user.user_metadata?.['user_type'] || 'renter',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { data: createdProfile, error: createError } = await this.supabase.client
                    .from('user_profiles')
                    .insert([newProfile])
                    .select()
                    .single();

                if (createError) {
                    console.error('SimpleAuth: Error creating profile:', createError);
                    this.updateAuthState({ isAuthenticated: true, user, profile: newProfile, isLoading: false });
                } else {
                    console.log('SimpleAuth: Profile created successfully');
                    this.updateAuthState({ isAuthenticated: true, user, profile: createdProfile, isLoading: false });
                }
            } else {
                console.log('SimpleAuth: Profile loaded successfully');
                this.updateAuthState({ isAuthenticated: true, user, profile, isLoading: false });
            }
        } catch (error) {
            console.error('SimpleAuth: Error loading profile:', error);
            this.updateAuthState({ isAuthenticated: true, user, profile: null, isLoading: false });
        }
    }

    private updateAuthState(newState: SimpleAuthState): void {
        console.log('SimpleAuth: Updating auth state:', newState);
        this.authState.next(newState);
    }

    // Public methods
    isAuthenticated(): boolean {
        return this.authState.value.isAuthenticated;
    }

    getCurrentUser(): any {
        return this.authState.value.user;
    }

    getCurrentProfile(): any {
        return this.authState.value.profile;
    }

    isLoading(): boolean {
        return this.authState.value.isLoading;
    }

    async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('SimpleAuth: Signing in user:', email);
            console.log('SimpleAuth: Supabase client:', this.supabase.client);

            const { data, error } = await this.supabase.client.auth.signInWithPassword({
                email,
                password
            });

            console.log('SimpleAuth: Sign in response - data:', data);
            console.log('SimpleAuth: Sign in response - error:', error);

            if (error) {
                console.error('SimpleAuth: Sign in error:', error);
                console.error('SimpleAuth: Error details:', {
                    message: error.message,
                    status: error.status
                });
                return { success: false, error: error.message };
            }

            console.log('SimpleAuth: Sign in successful, user:', data.user);
            return { success: true };
        } catch (error: any) {
            console.error('SimpleAuth: Sign in exception:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    async signOut(): Promise<void> {
        try {
            console.log('SimpleAuth: Signing out user');

            const { error } = await this.supabase.client.auth.signOut();

            if (error) {
                console.error('SimpleAuth: Sign out error:', error);
            }

            this.updateAuthState({ isAuthenticated: false, user: null, profile: null, isLoading: false });
            this.router.navigate(['/']);
        } catch (error) {
            console.error('SimpleAuth: Sign out error:', error);
        }
    }

    debugAuthStatus(): void {
        console.log('=== SIMPLE AUTH DEBUG ===');
        console.log('Auth State:', this.authState.value);
        console.log('Is Authenticated:', this.isAuthenticated());
        console.log('Current User:', this.getCurrentUser());
        console.log('Current Profile:', this.getCurrentProfile());
        console.log('Is Loading:', this.isLoading());
        console.log('========================');
    }
}

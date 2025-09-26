import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  user_type: 'renter' | 'owner' | 'admin';
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  bio?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  user_type: 'renter' | 'owner';
  phone_number?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

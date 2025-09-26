import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface CarListingData {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    description?: string;
    daily_rate: number;
    location: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
    images: string[];
    features: string[];
    transmission?: string;
    fuel_type?: string;
    seats?: number;
    weekly_discount?: number;
    monthly_discount?: number;
}

export interface CarListingResponse {
    success: boolean;
    carId?: string;
    error?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CarService {
    constructor(
        private supabase: SupabaseService,
        private authService: AuthService
    ) { }

    // Test database connection
    async testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('Testing database connection...');
            const { data, error } = await this.supabase.client
                .from('cars')
                .select('count')
                .limit(1);

            if (error) {
                console.error('Database connection test failed:', error);
                return { success: false, error: error.message };
            }

            console.log('Database connection test successful');
            return { success: true };
        } catch (error: any) {
            console.error('Database connection test error:', error);
            return { success: false, error: error.message };
        }
    }

    async createCarListing(carData: CarListingData): Promise<CarListingResponse> {
        try {
            console.log('CarService.createCarListing called with:', carData);

            const currentUser = this.authService.currentUser();
            console.log('Current user:', currentUser);

            if (!currentUser) {
                console.log('No current user found');
                return { success: false, error: 'User not authenticated' };
            }

            const currentProfile = this.authService.currentProfile();
            console.log('Current profile:', currentProfile);

            if (!currentProfile) {
                console.log('No current profile found');
                return { success: false, error: 'User profile not found. Please complete your profile setup first.' };
            }

            // Verify the profile exists in the database
            console.log('Verifying profile exists in database...');
            const { data: profileData, error: profileError } = await this.supabase.client
                .from('user_profiles')
                .select('id')
                .eq('id', currentProfile.id)
                .single();

            if (profileError || !profileData) {
                console.error('Profile not found in database:', profileError);
                return { success: false, error: 'User profile not found in database. Please complete your profile setup first.' };
            }

            console.log('Profile verified in database:', profileData);

            // Prepare car data for database
            const carListingData = {
                owner_id: currentProfile.id,
                make: carData.make,
                model: carData.model,
                year: carData.year,
                color: carData.color,
                license_plate: carData.license_plate,
                description: carData.description || '',
                daily_rate: carData.daily_rate,
                location: carData.location,
                city: carData.city,
                state: carData.state,
                latitude: carData.latitude,
                longitude: carData.longitude,
                images: carData.images,
                features: carData.features,
                is_available: true,
                is_verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('Creating car listing with data:', carListingData);

            console.log('Calling Supabase insert...');

            try {
                // Add timeout to prevent hanging
                const insertPromise = this.supabase.client
                    .from('cars')
                    .insert([carListingData])
                    .select()
                    .single();

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Database operation timeout')), 5000)
                );

                const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

                console.log('Supabase response - data:', data);
                console.log('Supabase response - error:', error);

                if (error) {
                    console.error('Supabase error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });

                    // Check for specific error types
                    if (error.code === '23503') {
                        console.error('Foreign key constraint violation - owner_id not found in user_profiles');
                        return { success: false, error: 'User profile not found. Please complete your profile setup first.' };
                    }

                    if (error.code === '42501') {
                        console.error('Permission denied - RLS policy blocking insert');
                        return { success: false, error: 'Permission denied. Please check your account permissions.' };
                    }
                }

                return { success: !error, carId: data?.id, error: error?.message };

            } catch (insertError: any) {
                console.error('Insert operation failed:', insertError);
                return { success: false, error: insertError.message || 'Database insert failed' };
            }

        } catch (error: any) {
            console.error('Unexpected error creating car listing:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    async uploadCarImages(images: File[]): Promise<{ success: boolean; imageUrls?: string[]; error?: string }> {
        try {
            console.log('CarService.uploadCarImages called with:', images.length, 'images');
            const imageUrls: string[] = [];

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                console.log(`Uploading image ${i + 1}/${images.length}:`, image.name);

                // Generate unique filename
                const fileExt = image.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `car-images/${fileName}`;

                console.log('Uploading to path:', filePath);

                // Upload to Supabase Storage
                const { data, error } = await this.supabase.client.storage
                    .from('car-images')
                    .upload(filePath, image);

                console.log('Upload result - data:', data);
                console.log('Upload result - error:', error);

                if (error) {
                    console.error('Error uploading image:', error);
                    return { success: false, error: `Failed to upload image: ${error.message}` };
                }

                // Get public URL
                const { data: urlData } = this.supabase.client.storage
                    .from('car-images')
                    .getPublicUrl(filePath);

                console.log('Public URL:', urlData.publicUrl);
                imageUrls.push(urlData.publicUrl);
            }

            console.log('All images uploaded successfully:', imageUrls);
            return { success: true, imageUrls };

        } catch (error: any) {
            console.error('Error uploading car images:', error);
            return { success: false, error: error.message || 'Failed to upload images' };
        }
    }

    async getCarListings(ownerId?: string): Promise<{ success: boolean; cars?: any[]; error?: string }> {
        try {
            let query = this.supabase.client
                .from('cars')
                .select('*')
                .order('created_at', { ascending: false });

            if (ownerId) {
                query = query.eq('owner_id', ownerId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching car listings:', error);
                return { success: false, error: error.message };
            }

            return { success: true, cars: data };

        } catch (error: any) {
            console.error('Error fetching car listings:', error);
            return { success: false, error: error.message || 'Failed to fetch car listings' };
        }
    }

    async updateCarListing(carId: string, updates: Partial<CarListingData>): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await this.supabase.client
                .from('cars')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', carId);

            if (error) {
                console.error('Error updating car listing:', error);
                return { success: false, error: error.message };
            }

            return { success: true };

        } catch (error: any) {
            console.error('Error updating car listing:', error);
            return { success: false, error: error.message || 'Failed to update car listing' };
        }
    }

    async deleteCarListing(carId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await this.supabase.client
                .from('cars')
                .delete()
                .eq('id', carId);

            if (error) {
                console.error('Error deleting car listing:', error);
                return { success: false, error: error.message };
            }

            return { success: true };

        } catch (error: any) {
            console.error('Error deleting car listing:', error);
            return { success: false, error: error.message || 'Failed to delete car listing' };
        }
    }

    // Helper method to parse location into city and state
    parseLocation(location: string): { city: string; state: string } {
        // Simple parsing - in a real app, you might use a geocoding service
        const parts = location.split(',').map(part => part.trim());

        if (parts.length >= 2) {
            return {
                city: parts[0],
                state: parts[1]
            };
        }

        // Default to Lagos if parsing fails
        return {
            city: 'Lagos',
            state: 'Lagos'
        };
    }

    // Get user-specific bookings
    async getUserBookings(ownerId: string): Promise<{ success: boolean; bookings?: any[]; error?: string }> {
        try {
            console.log('Fetching bookings for user:', ownerId);

            const { data, error } = await this.supabase.client
                .from('bookings')
                .select(`
                    *,
                    cars!inner(owner_id),
                    user_profiles!bookings_renter_id_fkey(full_name, email)
                `)
                .eq('cars.owner_id', ownerId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user bookings:', error);
                return { success: false, error: error.message };
            }

            console.log('User bookings loaded:', data);
            return { success: true, bookings: data };

        } catch (error: any) {
            console.error('Error fetching user bookings:', error);
            return { success: false, error: error.message || 'Failed to fetch user bookings' };
        }
    }

    // Get user-specific reviews
    async getUserReviews(ownerId: string): Promise<{ success: boolean; reviews?: any[]; error?: string }> {
        try {
            console.log('Fetching reviews for user:', ownerId);

            const { data, error } = await this.supabase.client
                .from('reviews')
                .select(`
                    *,
                    cars!inner(owner_id),
                    user_profiles!reviews_renter_id_fkey(full_name, email)
                `)
                .eq('cars.owner_id', ownerId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user reviews:', error);
                return { success: false, error: error.message };
            }

            console.log('User reviews loaded:', data);
            return { success: true, reviews: data };

        } catch (error: any) {
            console.error('Error fetching user reviews:', error);
            return { success: false, error: error.message || 'Failed to fetch user reviews' };
        }
    }
}

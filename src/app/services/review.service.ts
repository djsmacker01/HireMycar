import { Injectable } from '@angular/core';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

// Interfaces
export interface Review {
    id: string;
    booking_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number;
    comment?: string;
    status: 'pending' | 'approved' | 'rejected';
    helpful_count: number;
    reported_count: number;
    admin_notes?: string;
    created_at: string;
    reviewer?: {
        full_name: string;
        avatar_url?: string;
    };
    reviewee?: {
        full_name: string;
    };
    booking?: {
        car_id: string;
        start_date: string;
        end_date: string;
        car?: {
            make: string;
            model: string;
            year: number;
        };
    };
}

export interface ReviewData {
    booking_id: string;
    rating: number;
    comment?: string;
}

export interface ReviewHelpfulness {
    id: string;
    review_id: string;
    user_id: string;
    is_helpful: boolean;
    created_at: string;
}

export interface ReviewReport {
    id: string;
    review_id: string;
    reporter_id: string;
    reason: string;
    description?: string;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    created_at: string;
    resolved_at?: string;
}

export interface CarRating {
    car_id: string;
    average_rating: number;
    total_reviews: number;
    rating_breakdown: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private reviewsSubject = new BehaviorSubject<Review[]>([]);
    public reviews$ = this.reviewsSubject.asObservable();

    constructor(
        private supabase: SupabaseService,
        private authService: AuthService
    ) { }

    // Review Submission
    async submitReview(reviewData: ReviewData): Promise<{ success: boolean; review?: Review; error?: string }> {
        try {
            const currentUser = this.authService.currentUser();
            if (!currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            // Validate that the booking exists and belongs to the user
            const { data: booking, error: bookingError } = await this.supabase.client
                .from('bookings')
                .select(`
          *,
          car:cars!bookings_car_id_fkey(make, model, year, owner_id)
        `)
                .eq('id', reviewData.booking_id)
                .eq('renter_id', currentUser.id)
                .eq('status', 'completed')
                .single();

            if (bookingError || !booking) {
                return { success: false, error: 'Booking not found or not eligible for review' };
            }

            // Check if review already exists for this booking
            const { data: existingReview, error: existingError } = await this.supabase.client
                .from('reviews')
                .select('id')
                .eq('booking_id', reviewData.booking_id)
                .eq('reviewer_id', currentUser.id)
                .single();

            if (existingReview) {
                return { success: false, error: 'Review already exists for this booking' };
            }

            // Create the review
            const reviewPayload = {
                booking_id: reviewData.booking_id,
                reviewer_id: currentUser.id,
                reviewee_id: booking.car.owner_id,
                rating: reviewData.rating,
                comment: reviewData.comment,
                status: 'approved' // Auto-approve for now, can be changed to 'pending' for moderation
            };

            const { data, error } = await this.supabase.client
                .from('reviews')
                .insert([reviewPayload])
                .select(`
          *,
          reviewer:user_profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
          reviewee:user_profiles!reviews_reviewee_id_fkey(full_name),
          booking:bookings!reviews_booking_id_fkey(
            car_id,
            start_date,
            end_date,
            car:cars!bookings_car_id_fkey(make, model, year)
          )
        `)
                .single();

            if (error) {
                console.error('Error creating review:', error);
                return { success: false, error: error.message };
            }

            // Update car rating
            await this.updateCarRating(booking.car_id);

            return { success: true, review: data };
        } catch (error: any) {
            console.error('Error in submitReview:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    // Get Reviews
    async getReviewsForCar(carId: string): Promise<Review[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select(`
          *,
          reviewer:user_profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
          reviewee:user_profiles!reviews_reviewee_id_fkey(full_name),
          booking:bookings!reviews_booking_id_fkey(
            car_id,
            start_date,
            end_date,
            car:cars!bookings_car_id_fkey(make, model, year)
          )
        `)
                .eq('booking.car_id', carId)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching car reviews:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getReviewsForCar:', error);
            return [];
        }
    }

    async getReviewsForUser(userId: string): Promise<Review[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select(`
          *,
          reviewer:user_profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
          reviewee:user_profiles!reviews_reviewee_id_fkey(full_name),
          booking:bookings!reviews_booking_id_fkey(
            car_id,
            start_date,
            end_date,
            car:cars!bookings_car_id_fkey(make, model, year)
          )
        `)
                .eq('reviewee_id', userId)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user reviews:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getReviewsForUser:', error);
            return [];
        }
    }

    async getUserReviews(userId: string): Promise<Review[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select(`
          *,
          reviewer:user_profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
          reviewee:user_profiles!reviews_reviewee_id_fkey(full_name),
          booking:bookings!reviews_booking_id_fkey(
            car_id,
            start_date,
            end_date,
            car:cars!bookings_car_id_fkey(make, model, year)
          )
        `)
                .eq('reviewer_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user reviews:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getUserReviews:', error);
            return [];
        }
    }

    // Rating Calculations
    async calculateAverageRating(carId: string): Promise<number> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select('rating')
                .eq('booking.car_id', carId)
                .eq('status', 'approved');

            if (error || !data || data.length === 0) {
                return 0;
            }

            const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
            return Math.round((totalRating / data.length) * 10) / 10; // Round to 1 decimal place
        } catch (error) {
            console.error('Error in calculateAverageRating:', error);
            return 0;
        }
    }

    async calculateUserRating(userId: string): Promise<number> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select('rating')
                .eq('reviewee_id', userId)
                .eq('status', 'approved');

            if (error || !data || data.length === 0) {
                return 0;
            }

            const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
            return Math.round((totalRating / data.length) * 10) / 10;
        } catch (error) {
            console.error('Error in calculateUserRating:', error);
            return 0;
        }
    }

    async getCarRatingDetails(carId: string): Promise<CarRating> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select('rating')
                .eq('booking.car_id', carId)
                .eq('status', 'approved');

            if (error || !data) {
                return {
                    car_id: carId,
                    average_rating: 0,
                    total_reviews: 0,
                    rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                };
            }

            const totalReviews = data.length;
            const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

            const ratingBreakdown = data.reduce((acc, review) => {
                acc[review.rating as keyof typeof acc]++;
                return acc;
            }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

            return {
                car_id: carId,
                average_rating: averageRating,
                total_reviews: totalReviews,
                rating_breakdown: ratingBreakdown
            };
        } catch (error) {
            console.error('Error in getCarRatingDetails:', error);
            return {
                car_id: carId,
                average_rating: 0,
                total_reviews: 0,
                rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
        }
    }

    // Review Helpfulness
    async markReviewHelpful(reviewId: string, isHelpful: boolean): Promise<boolean> {
        try {
            const currentUser = this.authService.currentUser();
            if (!currentUser) {
                console.error('User not authenticated');
                return false;
            }

            const { error } = await this.supabase.client
                .from('review_helpfulness')
                .upsert([{
                    review_id: reviewId,
                    user_id: currentUser.id,
                    is_helpful: isHelpful
                }], {
                    onConflict: 'review_id,user_id'
                });

            if (error) {
                console.error('Error marking review helpful:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in markReviewHelpful:', error);
            return false;
        }
    }

    async getReviewHelpfulness(reviewId: string): Promise<ReviewHelpfulness[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('review_helpfulness')
                .select('*')
                .eq('review_id', reviewId);

            if (error) {
                console.error('Error fetching review helpfulness:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getReviewHelpfulness:', error);
            return [];
        }
    }

    // Review Reporting
    async reportReview(reviewId: string, reason: string, description?: string): Promise<boolean> {
        try {
            const currentUser = this.authService.currentUser();
            if (!currentUser) {
                console.error('User not authenticated');
                return false;
            }

            const { error } = await this.supabase.client
                .from('review_reports')
                .insert([{
                    review_id: reviewId,
                    reporter_id: currentUser.id,
                    reason,
                    description
                }]);

            if (error) {
                console.error('Error reporting review:', error);
                return false;
            }

            // Update reported count
            await this.supabase.client
                .from('reviews')
                .update({ reported_count: this.supabase.client.rpc('increment', { column: 'reported_count', value: 1 }) })
                .eq('id', reviewId);

            return true;
        } catch (error) {
            console.error('Error in reportReview:', error);
            return false;
        }
    }

    // Admin Functions
    async getPendingReviews(): Promise<Review[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select(`
          *,
          reviewer:user_profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
          reviewee:user_profiles!reviews_reviewee_id_fkey(full_name),
          booking:bookings!reviews_booking_id_fkey(
            car_id,
            start_date,
            end_date,
            car:cars!bookings_car_id_fkey(make, model, year)
          )
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching pending reviews:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getPendingReviews:', error);
            return [];
        }
    }

    async moderateReview(reviewId: string, status: 'approved' | 'rejected', adminNotes?: string): Promise<boolean> {
        try {
            const updateData: any = {
                status,
                updated_at: new Date().toISOString()
            };

            if (adminNotes) {
                updateData.admin_notes = adminNotes;
            }

            const { error } = await this.supabase.client
                .from('reviews')
                .update(updateData)
                .eq('id', reviewId);

            if (error) {
                console.error('Error moderating review:', error);
                return false;
            }

            // If approved, update car rating
            if (status === 'approved') {
                const { data: review } = await this.supabase.client
                    .from('reviews')
                    .select('booking!inner(car_id)')
                    .eq('id', reviewId)
                    .single();

                if (review && review.booking && review.booking.length > 0) {
                    await this.updateCarRating(review.booking[0].car_id);
                }
            }

            return true;
        } catch (error) {
            console.error('Error in moderateReview:', error);
            return false;
        }
    }

    async getReviewReports(): Promise<ReviewReport[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('review_reports')
                .select(`
          *,
          review:reviews!review_reports_review_id_fkey(
            id,
            comment,
            rating,
            reviewer:user_profiles!reviews_reviewer_id_fkey(full_name)
          ),
          reporter:user_profiles!review_reports_reporter_id_fkey(full_name)
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching review reports:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getReviewReports:', error);
            return [];
        }
    }

    // Statistics
    async getReviewStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }> {
        try {
            const { data, error } = await this.supabase.client
                .from('reviews')
                .select('status');

            if (error) {
                console.error('Error fetching review stats:', error);
                return { total: 0, pending: 0, approved: 0, rejected: 0 };
            }

            const stats = data.reduce((acc, review) => {
                acc.total++;
                acc[review.status as keyof typeof acc]++;
                return acc;
            }, { total: 0, pending: 0, approved: 0, rejected: 0 });

            return stats;
        } catch (error) {
            console.error('Error in getReviewStats:', error);
            return { total: 0, pending: 0, approved: 0, rejected: 0 };
        }
    }

    // Helper Functions
    private async updateCarRating(carId: string): Promise<void> {
        try {
            const ratingDetails = await this.getCarRatingDetails(carId);

            // Update cars table with new rating
            await this.supabase.client
                .from('cars')
                .update({
                    rating: ratingDetails.average_rating,
                    review_count: ratingDetails.total_reviews
                })
                .eq('id', carId);
        } catch (error) {
            console.error('Error updating car rating:', error);
        }
    }

    // Real-time subscriptions
    subscribeToReviews(): Observable<Review[]> {
        return new Observable(subscriber => {
            const channel = this.supabase.client
                .channel('reviews_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'reviews'
                }, (payload) => {
                    console.log('Review change:', payload);
                })
                .subscribe();

            return () => {
                this.supabase.client.removeChannel(channel);
            };
        });
    }
}

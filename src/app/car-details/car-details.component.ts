import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review, ReviewData, CarRating } from '../services/review.service';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

// Interfaces
export interface CarDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  location: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  description: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  seats: number;
  isAvailable: boolean;
  host: Host;
  reviews: LocalReview[];
  availability: AvailabilityDate[];
  pickupLocation: string;
  dropoffLocation: string;
  insurance: string;
  cancellationPolicy: string;
}

export interface Host {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  responseRate: number;
  responseTime: string;
  verified: boolean;
  totalTrips: number;
  languages: string[];
  bio: string;
}

export interface LocalReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  date: string;
  tripDate: string;
  helpful: number;
}

export interface AvailabilityDate {
  date: string;
  isAvailable: boolean;
  price?: number;
}

export interface Booking {
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  insuranceFee: number;
  total: number;
}

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './car-details.component.html',
  styleUrls: ['./car-details.component.scss']
})
export class CarDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private authService: AuthService,
    private supabase: SupabaseService
  ) { }

  // Car details
  car: CarDetails | null = null;
  currentImageIndex = 0;
  showAllImages = false;

  // Booking
  booking: Booking = {
    startDate: '',
    endDate: '',
    days: 0,
    dailyRate: 0,
    subtotal: 0,
    serviceFee: 0,
    insuranceFee: 0,
    total: 0
  };

  // UI states
  isLoading = true;
  showBookingForm = false;
  showAllReviews = false;
  showHostDetails = false;

  // Review system
  databaseReviews: Review[] = [];
  carRating: CarRating | null = null;
  showReviewForm = false;
  isSubmittingReview = false;
  reviewForm = {
    rating: 5,
    comment: ''
  };
  userCompletedBookings: any[] = [];
  isLoggedIn = false;

  // Mock data
  private mockCar: CarDetails = {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    type: 'Sedan',
    pricePerDay: 25000,
    location: 'Lagos',
    rating: 4.8,
    reviewCount: 24,
    mileage: 45000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    isAvailable: true,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617470706004-e6c5f0c6d10c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
    ],
    features: [
      'Air Conditioning',
      'Bluetooth Connectivity',
      'GPS Navigation',
      'Backup Camera',
      'Leather Seats',
      'Sunroof',
      'USB Charging',
      'Apple CarPlay',
      'Android Auto',
      'Cruise Control',
      'Keyless Entry',
      'Push Start'
    ],
    description: `Experience luxury and comfort with this pristine 2022 Toyota Camry. This well-maintained sedan offers the perfect blend of style, performance, and reliability for your journey across Nigeria.

The vehicle comes equipped with modern amenities including automatic transmission, climate control, and advanced safety features. Perfect for business trips, family outings, or exploring the beautiful cities of Nigeria.

The car is regularly serviced and maintained to ensure optimal performance and safety. All safety features are fully functional, and the vehicle is insured for your peace of mind.`,
    host: {
      id: '1',
      name: 'John Adebayo',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 156,
      memberSince: '2020-03-15',
      responseRate: 98,
      responseTime: '1 hour',
      verified: true,
      totalTrips: 89,
      languages: ['English', 'Yoruba'],
      bio: 'Professional car enthusiast with over 3 years of hosting experience. I maintain my vehicles to the highest standards and ensure every guest has a comfortable and safe journey.'
    },
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Wilson',
        userPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Excellent car and amazing host! The Camry was in perfect condition and John was very responsive. Highly recommend!',
        date: '2024-01-15',
        tripDate: '2024-01-10',
        helpful: 12
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Michael Chen',
        userPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Great experience! The car was clean, well-maintained, and the pickup/dropoff process was smooth. Will definitely rent again.',
        date: '2024-01-08',
        tripDate: '2024-01-05',
        helpful: 8
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Fatima Yusuf',
        userPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        rating: 4,
        comment: 'Good car overall. Clean and comfortable. The only minor issue was the GPS signal was weak in some areas, but John was very helpful.',
        date: '2024-01-03',
        tripDate: '2023-12-28',
        helpful: 5
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'David Okonkwo',
        userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Perfect rental experience! The car exceeded my expectations. John is a professional host who really cares about his guests.',
        date: '2023-12-25',
        tripDate: '2023-12-20',
        helpful: 15
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'Grace Adebayo',
        userPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Amazing car and service! The Toyota Camry was in excellent condition and the host was very accommodating. Highly recommended!',
        date: '2023-12-18',
        tripDate: '2023-12-15',
        helpful: 9
      }
    ],
    availability: this.generateAvailabilityDates(),
    pickupLocation: 'Victoria Island, Lagos',
    dropoffLocation: 'Victoria Island, Lagos',
    insurance: 'Comprehensive coverage included',
    cancellationPolicy: 'Free cancellation up to 24 hours before trip'
  };

  ngOnInit(): void {
    this.checkAuthStatus();
    this.route.params.subscribe(params => {
      const carId = params['id'];
      this.loadCarDetails(carId);
      this.loadCarReviews(carId);
      this.loadCarRating(carId);
      this.loadUserCompletedBookings(carId);
    });
  }

  loadCarDetails(carId: string): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.car = this.mockCar;
      this.booking.dailyRate = this.car.pricePerDay;
      this.isLoading = false;
    }, 1000);
  }

  // Image gallery methods
  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  nextImage(): void {
    if (this.car && this.currentImageIndex < this.car.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  // Booking methods
  onDateChange(): void {
    if (this.booking.startDate && this.booking.endDate) {
      const start = new Date(this.booking.startDate);
      const end = new Date(this.booking.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      this.booking.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (this.car) {
        this.booking.dailyRate = this.car.pricePerDay;
        this.booking.subtotal = this.booking.days * this.booking.dailyRate;
        this.booking.serviceFee = Math.round(this.booking.subtotal * 0.10);
        this.booking.insuranceFee = Math.round(this.booking.subtotal * 0.05);
        this.booking.total = this.booking.subtotal + this.booking.serviceFee + this.booking.insuranceFee;
      }
    }
  }

  bookNow(): void {
    if (this.booking.startDate && this.booking.endDate) {
      console.log('Booking:', this.booking);
      // TODO: Implement booking logic
      alert('Booking functionality will be implemented here');
    } else {
      alert('Please select your travel dates');
    }
  }

  contactHost(): void {
    console.log('Contact host:', this.car?.host.name);
    // TODO: Implement contact host logic
    alert('Contact host functionality will be implemented here');
  }

  // Utility methods
  getStarRating(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getMemberSince(date: string): string {
    const memberDate = new Date(date);
    const now = new Date();
    const diffYears = now.getFullYear() - memberDate.getFullYear();
    return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  }

  getDayFromDate(date: string): number {
    return new Date(date).getDate();
  }

  isDateAvailable(date: string): boolean {
    if (!this.car) return false;
    const availability = this.car.availability.find(a => a.date === date);
    return availability ? availability.isAvailable : true;
  }

  private generateAvailabilityDates(): AvailabilityDate[] {
    const dates: AvailabilityDate[] = [];
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      // Randomly make some dates unavailable
      const isAvailable = Math.random() > 0.2; // 80% availability

      dates.push({
        date: dateString,
        isAvailable: isAvailable,
        price: 25000
      });
    }

    return dates;
  }

  // UI toggle methods
  toggleBookingForm(): void {
    this.showBookingForm = !this.showBookingForm;
  }

  toggleAllReviews(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  toggleHostDetails(): void {
    this.showHostDetails = !this.showHostDetails;
  }

  toggleAllImages(): void {
    this.showAllImages = !this.showAllImages;
  }

  // Review system methods
  private checkAuthStatus(): void {
    this.isLoggedIn = !!this.authService.currentUser();
  }

  private async loadCarReviews(carId: string): Promise<void> {
    try {
      this.databaseReviews = await this.reviewService.getReviewsForCar(carId);
    } catch (error) {
      console.error('Error loading car reviews:', error);
    }
  }

  private async loadCarRating(carId: string): Promise<void> {
    try {
      this.carRating = await this.reviewService.getCarRatingDetails(carId);

      // Update car rating if we have car data
      if (this.car) {
        this.car.rating = this.carRating.average_rating;
        this.car.reviewCount = this.carRating.total_reviews;
      }
    } catch (error) {
      console.error('Error loading car rating:', error);
    }
  }

  private async loadUserCompletedBookings(carId: string): Promise<void> {
    if (!this.isLoggedIn) return;

    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) return;

      const { data, error } = await this.supabase.client
        .from('bookings')
        .select(`
          *,
          car:cars!bookings_car_id_fkey(id, make, model, year)
        `)
        .eq('renter_id', currentUser.id)
        .eq('car_id', carId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error loading user bookings:', error);
        return;
      }

      this.userCompletedBookings = data || [];
    } catch (error) {
      console.error('Error in loadUserCompletedBookings:', error);
    }
  }

  get allReviews(): (Review | LocalReview)[] {
    // Combine database reviews with local mock reviews
    const dbReviews = this.databaseReviews.map(review => ({
      id: review.id,
      userId: review.reviewer_id,
      userName: review.reviewer?.full_name || 'Anonymous',
      userPhoto: review.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      rating: review.rating,
      comment: review.comment || '',
      date: review.created_at,
      tripDate: review.booking?.start_date || '',
      helpful: review.helpful_count
    }));

    return [...dbReviews, ...(this.car?.reviews || [])];
  }

  get canUserReview(): boolean {
    return this.isLoggedIn && this.userCompletedBookings.length > 0;
  }

  get hasUserReviewed(): boolean {
    if (!this.isLoggedIn || !this.car) return false;

    const currentUser = this.authService.currentUser();
    return this.databaseReviews.some(review => review.reviewer_id === currentUser?.id);
  }

  toggleReviewForm(): void {
    if (!this.isLoggedIn) {
      alert('Please log in to write a review');
      return;
    }

    if (!this.canUserReview) {
      alert('You can only review cars you have rented');
      return;
    }

    if (this.hasUserReviewed) {
      alert('You have already reviewed this car');
      return;
    }

    this.showReviewForm = !this.showReviewForm;
  }

  async submitReview(): Promise<void> {
    if (!this.isLoggedIn || !this.canUserReview || this.hasUserReviewed) {
      return;
    }

    this.isSubmittingReview = true;

    try {
      // Find the most recent completed booking for this car
      const latestBooking = this.userCompletedBookings[0];

      const reviewData: ReviewData = {
        booking_id: latestBooking.id,
        rating: this.reviewForm.rating,
        comment: this.reviewForm.comment
      };

      const result = await this.reviewService.submitReview(reviewData);

      if (result.success) {
        // Refresh reviews and rating
        await this.loadCarReviews(this.car!.id);
        await this.loadCarRating(this.car!.id);

        // Reset form and hide it
        this.reviewForm = { rating: 5, comment: '' };
        this.showReviewForm = false;

        alert('Thank you for your review!');
      } else {
        alert('Failed to submit review: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review');
    } finally {
      this.isSubmittingReview = false;
    }
  }

  async markReviewHelpful(reviewId: string): Promise<void> {
    if (!this.isLoggedIn) {
      alert('Please log in to mark reviews as helpful');
      return;
    }

    try {
      const success = await this.reviewService.markReviewHelpful(reviewId, true);
      if (success) {
        // Refresh reviews to show updated helpful count
        await this.loadCarReviews(this.car!.id);
      }
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  }

  async reportReview(reviewId: string): Promise<void> {
    if (!this.isLoggedIn) {
      alert('Please log in to report reviews');
      return;
    }

    const reason = prompt('Please provide a reason for reporting this review:');
    if (!reason) return;

    try {
      const success = await this.reviewService.reportReview(reviewId, reason);
      if (success) {
        alert('Review reported successfully');
      } else {
        alert('Failed to report review');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      alert('An error occurred while reporting the review');
    }
  }

  getRatingBreakdown(): { rating: number; count: number; percentage: number }[] {
    if (!this.carRating) return [];

    const total = this.carRating.total_reviews;
    return [
      { rating: 5, count: this.carRating.rating_breakdown[5], percentage: total > 0 ? (this.carRating.rating_breakdown[5] / total) * 100 : 0 },
      { rating: 4, count: this.carRating.rating_breakdown[4], percentage: total > 0 ? (this.carRating.rating_breakdown[4] / total) * 100 : 0 },
      { rating: 3, count: this.carRating.rating_breakdown[3], percentage: total > 0 ? (this.carRating.rating_breakdown[3] / total) * 100 : 0 },
      { rating: 2, count: this.carRating.rating_breakdown[2], percentage: total > 0 ? (this.carRating.rating_breakdown[2] / total) * 100 : 0 },
      { rating: 1, count: this.carRating.rating_breakdown[1], percentage: total > 0 ? (this.carRating.rating_breakdown[1] / total) * 100 : 0 }
    ];
  }
} 
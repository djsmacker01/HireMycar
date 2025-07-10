import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';

export interface CarDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  images: string[];
  description: string;
  dailyRate: number;
  location: {
    city: string;
    state: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  features: string[];
  specifications: {
    transmission: string;
    fuelType: string;
    seats: number;
    doors: number;
    mileage: string;
    engineSize: string;
  };
  host: Host;
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  availability: { [date: string]: boolean };
  instantBook: boolean;
  cancellationPolicy: string;
}

export interface Host {
  id: string;
  name: string;
  photo: string;
  rating: number;
  totalReviews: number;
  memberSince: string;
  responseRate: number;
  responseTime: string;
  verified: boolean;
  languages: string[];
}

export interface Review {
  id: string;
  guestName: string;
  guestPhoto: string;
  rating: number;
  comment: string;
  date: string;
  tripDate: string;
}

export interface Booking {
  startDate: Date | null;
  endDate: Date | null;
  totalDays: number;
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  insurance: number;
  total: number;
}

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './car-details.component.html',
  styleUrls: ['./car-details.component.scss']
})
export class CarDetailsComponent implements OnInit {
  car!: CarDetails;
  selectedImageIndex = 0;
  bookingForm: FormGroup;
  booking: Booking = {
    startDate: null,
    endDate: null,
    totalDays: 0,
    dailyRate: 0,
    subtotal: 0,
    serviceFee: 0,
    insurance: 0,
    total: 0
  };
  
  currentMonth = new Date();
  calendarDays: any[] = [];
  selectedDates: Date[] = [];
  isSelectingRange = false;
  
  // Mobile responsive states
  showAllFeatures = false;
  showAllReviews = false;
  activeSection = 'overview';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Get car ID from route parameter
    const carId = this.route.snapshot.paramMap.get('id');
    console.log('Car ID from route:', carId);
    
    this.loadCarDetails();
    this.generateCalendar();
    this.setupBookingCalculation();
  }

  loadCarDetails() {
    // Mock data for a single car
    this.car = {
      id: 'car-001',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=600&fit=crop'
      ],
      description: 'Experience luxury and comfort with this pristine 2022 Toyota Camry. Perfect for business trips, family outings, or special occasions around Lagos. This vehicle is meticulously maintained and comes with all modern amenities for a smooth and enjoyable ride.',
      dailyRate: 25000,
      location: {
        city: 'Lagos',
        state: 'Lagos',
        address: 'Victoria Island, Lagos',
        coordinates: { lat: 6.4281, lng: 3.4219 }
      },
      features: [
        'Air Conditioning',
        'Bluetooth',
        'GPS Navigation',
        'Backup Camera',
        'Heated Seats',
        'Sunroof',
        'USB Charging',
        'Keyless Entry',
        'Cruise Control',
        'Premium Sound System',
        'Lane Departure Warning',
        'Automatic Emergency Braking'
      ],
      specifications: {
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        doors: 4,
        mileage: '15 km/L',
        engineSize: '2.5L'
      },
      host: {
        id: 'host-001',
        name: 'Adebayo Okonkwo',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: 4.9,
        totalReviews: 127,
        memberSince: '2019',
        responseRate: 98,
        responseTime: '1 hour',
        verified: true,
        languages: ['English', 'Yoruba', 'Igbo']
      },
      reviews: [
        {
          id: 'rev-001',
          guestName: 'Chioma Adebayo',
          guestPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b332c4b5?w=50&h=50&fit=crop&crop=face',
          rating: 5,
          comment: 'Excellent car and great host! The Toyota Camry was in perfect condition and Adebayo was very responsive. Highly recommend for anyone visiting Lagos.',
          date: '2024-12-15',
          tripDate: '2024-12-10'
        },
        {
          id: 'rev-002',
          guestName: 'Emeka Okafor',
          guestPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          rating: 5,
          comment: 'Amazing experience! The car was clean, comfortable, and exactly as described. Perfect for my business meetings around the city.',
          date: '2024-12-08',
          tripDate: '2024-12-05'
        },
        {
          id: 'rev-003',
          guestName: 'Fatima Hassan',
          guestPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
          rating: 4,
          comment: 'Great car for family trips. Spacious and comfortable. The pickup process was smooth and Adebayo provided clear instructions.',
          date: '2024-11-28',
          tripDate: '2024-11-25'
        }
      ],
      totalReviews: 127,
      averageRating: 4.9,
      availability: this.generateAvailability(),
      instantBook: true,
      cancellationPolicy: 'Free cancellation up to 24 hours before pickup'
    };
    
    this.booking.dailyRate = this.car.dailyRate;
  }

  generateAvailability(): { [date: string]: boolean } {
    const availability: { [date: string]: boolean } = {};
    const today = new Date();
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Make some dates unavailable (randomly for demo)
      availability[dateStr] = Math.random() > 0.2;
    }
    
    return availability;
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isAvailable = this.car?.availability[dateStr] ?? true;
      const isPast = date < new Date();
      
      this.calendarDays.push({
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isAvailable: isAvailable && !isPast,
        isPast,
        isSelected: this.selectedDates.some(d => d.toDateString() === date.toDateString())
      });
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  previousImage() {
    this.selectedImageIndex = this.selectedImageIndex > 0 
      ? this.selectedImageIndex - 1 
      : this.car.images.length - 1;
  }

  nextImage() {
    this.selectedImageIndex = this.selectedImageIndex < this.car.images.length - 1 
      ? this.selectedImageIndex + 1 
      : 0;
  }

  selectDate(day: any) {
    if (!day.isAvailable) return;
    
    if (this.selectedDates.length === 0) {
      this.selectedDates = [day.date];
      this.isSelectingRange = true;
    } else if (this.selectedDates.length === 1) {
      const startDate = this.selectedDates[0];
      const endDate = day.date;
      
      if (endDate > startDate) {
        this.selectedDates = [startDate, endDate];
        this.booking.startDate = startDate;
        this.booking.endDate = endDate;
        this.calculateBooking();
      } else {
        this.selectedDates = [day.date];
      }
      this.isSelectingRange = false;
    } else {
      this.selectedDates = [day.date];
      this.isSelectingRange = true;
    }
    
    this.generateCalendar();
  }

  navigateCalendar(direction: number) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
    this.generateCalendar();
  }

  setupBookingCalculation() {
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateBooking();
    });
  }

  calculateBooking() {
    if (this.booking.startDate && this.booking.endDate) {
      const timeDiff = this.booking.endDate.getTime() - this.booking.startDate.getTime();
      this.booking.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      this.booking.subtotal = this.booking.totalDays * this.booking.dailyRate;
      this.booking.serviceFee = Math.round(this.booking.subtotal * 0.1);
      this.booking.insurance = Math.round(this.booking.subtotal * 0.05);
      this.booking.total = this.booking.subtotal + this.booking.serviceFee + this.booking.insurance;
    }
  }

  bookNow() {
    if (this.bookingForm.valid && this.booking.startDate && this.booking.endDate) {
      alert('Booking functionality would be implemented here');
    }
  }

  contactHost() {
    alert('Contact host functionality would be implemented here');
  }

  goBack() {
    this.location.back();
  }

  toggleFeatures() {
    this.showAllFeatures = !this.showAllFeatures;
  }

  toggleReviews() {
    this.showAllReviews = !this.showAllReviews;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 
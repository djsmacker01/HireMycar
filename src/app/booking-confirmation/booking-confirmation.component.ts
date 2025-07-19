import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Interfaces
interface BookingData {
  carId: string;
  carName: string;
  carImage: string;
  pickupDate: Date;
  returnDate: Date;
  location: string;
  dailyRate: number;
}

interface PaymentMethod {
  type: 'card';
  provider: 'paystack';
}

interface BookingConfirmation {
  confirmationNumber: string;
  hostName: string;
  hostPhone: string;
  pickupLocation: string;
}

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
  @Input() bookingData?: BookingData;

  bookingForm!: FormGroup;
  selectedPaymentMethod: PaymentMethod = { type: 'card', provider: 'paystack' };
  termsAccepted = false;
  isProcessing = false;
  bookingConfirmed = false;
  confirmationData?: BookingConfirmation;

  // Mock data for demonstration
  mockBookingData: BookingData = {
    carId: 'car-001',
    carName: 'Toyota Camry 2023',
    carImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    pickupDate: new Date('2024-01-15'),
    returnDate: new Date('2024-01-18'),
    location: 'Lagos, Nigeria',
    dailyRate: 25000
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBookingData();
  }

  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+234|0)[789][01]\d{8}$/)]],
      driversLicense: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private loadBookingData(): void {
    // In a real app, this would come from route params or service
    if (!this.bookingData) {
      this.bookingData = this.mockBookingData;
    }
  }

  get rentalDuration(): number {
    if (!this.bookingData) {
      return 0;
    }
    const diffTime = this.bookingData.returnDate.getTime() - this.bookingData.pickupDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get subtotal(): number {
    if (this.bookingData) {
      return this.bookingData.dailyRate * this.rentalDuration;
    }
    return 0;
  }

  get serviceFee(): number {
    return Math.round(this.subtotal * 0.05); // 5% service fee
  }

  get totalAmount(): number {
    return this.subtotal + this.serviceFee;
  }

  get isFormValid(): boolean {
    return this.bookingForm.valid && this.termsAccepted;
  }

  onTermsToggle(): void {
    this.termsAccepted = !this.termsAccepted;
  }

  async confirmBooking(): Promise<void> {
    if (!this.isFormValid) return;

    this.isProcessing = true;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock confirmation data
      this.confirmationData = {
        confirmationNumber: this.generateConfirmationNumber(),
        hostName: 'John Adebayo',
        hostPhone: '+234 801 234 5678',
        pickupLocation: this.bookingData!.location
      };

      this.bookingConfirmed = true;
    } catch (error) {
      console.error('Booking failed:', error);
      // Handle error state
    } finally {
      this.isProcessing = false;
    }
  }

  private generateConfirmationNumber(): string {
    return `HMC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/']);
  }

  viewBookings(): void {
    // Navigate to bookings page (to be implemented)
    this.router.navigate(['/']);
  }
} 
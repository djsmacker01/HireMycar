import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaces
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  type: CarType;
  pricePerDay: number;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  features: string[];
  isAvailable: boolean;
  owner: {
    name: string;
    rating: number;
    verified: boolean;
  };
}

export interface SearchFilters {
  location: string;
  startDate: string;
  endDate: string;
  carType: CarType | 'all';
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: SortOption;
}

export type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Luxury' | 'Van' | 'Truck';
export type SortOption = 'price-low' | 'price-high' | 'rating' | 'newest';

@Component({
  selector: 'app-car-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.scss']
})
export class CarSearchComponent implements OnInit {
  constructor(private router: Router) {}
  // Search filters
  filters: SearchFilters = {
    location: '',
    startDate: '',
    endDate: '',
    carType: 'all',
    priceRange: {
      min: 0,
      max: 50000
    },
    sortBy: 'newest'
  };

  // Available options
  locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Kaduna'];
  carTypes: CarType[] = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Van', 'Truck'];
  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Data
  allCars: Car[] = [];
  filteredCars: Car[] = [];
  isLoading = false;
  showFilters = false;

  // Mock data
  private mockCars: Car[] = [
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      type: 'Sedan',
      pricePerDay: 15000,
      location: 'Lagos',
      rating: 4.8,
      reviewCount: 24,
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', 'Bluetooth', 'Backup Camera'],
      isAvailable: true,
      owner: { name: 'John Doe', rating: 4.9, verified: true }
    },
    {
      id: '2',
      make: 'Honda',
      model: 'CR-V',
      year: 2021,
      type: 'SUV',
      pricePerDay: 25000,
      location: 'Abuja',
      rating: 4.6,
      reviewCount: 18,
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', '4WD', 'Leather Seats'],
      isAvailable: true,
      owner: { name: 'Sarah Wilson', rating: 4.7, verified: true }
    },
    {
      id: '3',
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2023,
      type: 'Luxury',
      pricePerDay: 45000,
      location: 'Lagos',
      rating: 4.9,
      reviewCount: 12,
      imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', 'Premium Sound', 'Navigation'],
      isAvailable: true,
      owner: { name: 'Michael Chen', rating: 5.0, verified: true }
    },
    {
      id: '4',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      type: 'Sedan',
      pricePerDay: 12000,
      location: 'Port Harcourt',
      rating: 4.5,
      reviewCount: 31,
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', 'Fuel Efficient'],
      isAvailable: true,
      owner: { name: 'David Okonkwo', rating: 4.6, verified: true }
    },
    {
      id: '5',
      make: 'Ford',
      model: 'Explorer',
      year: 2021,
      type: 'SUV',
      pricePerDay: 28000,
      location: 'Abuja',
      rating: 4.4,
      reviewCount: 15,
      imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', '7 Seats', '4WD'],
      isAvailable: true,
      owner: { name: 'Grace Adebayo', rating: 4.5, verified: true }
    },
    {
      id: '6',
      make: 'Volkswagen',
      model: 'Golf',
      year: 2022,
      type: 'Hatchback',
      pricePerDay: 18000,
      location: 'Lagos',
      rating: 4.7,
      reviewCount: 22,
      imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      features: ['Manual', 'AC', 'Sport Mode', 'Compact'],
      isAvailable: true,
      owner: { name: 'Emma Thompson', rating: 4.8, verified: true }
    },
    {
      id: '7',
      make: 'BMW',
      model: 'X5',
      year: 2023,
      type: 'Luxury',
      pricePerDay: 55000,
      location: 'Lagos',
      rating: 4.9,
      reviewCount: 8,
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', 'Premium Package', 'Panoramic Roof'],
      isAvailable: true,
      owner: { name: 'Alex Johnson', rating: 5.0, verified: true }
    },
    {
      id: '8',
      make: 'Toyota',
      model: 'Hilux',
      year: 2021,
      type: 'Truck',
      pricePerDay: 22000,
      location: 'Kano',
      rating: 4.3,
      reviewCount: 19,
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
      features: ['Manual', 'AC', '4WD', 'Durable'],
      isAvailable: true,
      owner: { name: 'Ahmed Hassan', rating: 4.4, verified: true }
    },
    {
      id: '9',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      type: 'Sedan',
      pricePerDay: 16000,
      location: 'Ibadan',
      rating: 4.6,
      reviewCount: 27,
      imageUrl: 'https://images.unsplash.com/photo-1617470706004-e6c5f0c6d10c?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', 'Sport Design', 'Efficient'],
      isAvailable: true,
      owner: { name: 'Oluwaseun Adeyemi', rating: 4.7, verified: true }
    },
    {
      id: '10',
      make: 'Toyota',
      model: 'Sienna',
      year: 2020,
      type: 'Van',
      pricePerDay: 20000,
      location: 'Port Harcourt',
      rating: 4.5,
      reviewCount: 14,
      imageUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', '8 Seats', 'Family Friendly'],
      isAvailable: true,
      owner: { name: 'Patricia Eze', rating: 4.6, verified: true }
    },
    {
      id: '11',
      make: 'Lexus',
      model: 'RX',
      year: 2023,
      type: 'Luxury',
      pricePerDay: 48000,
      location: 'Abuja',
      rating: 4.8,
      reviewCount: 11,
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', 'Hybrid', 'Premium Interior'],
      isAvailable: true,
      owner: { name: 'Robert Williams', rating: 4.9, verified: true }
    },
    {
      id: '12',
      make: 'Nissan',
      model: 'Altima',
      year: 2021,
      type: 'Sedan',
      pricePerDay: 14000,
      location: 'Kaduna',
      rating: 4.4,
      reviewCount: 16,
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
      features: ['Automatic', 'AC', 'Comfortable', 'Reliable'],
      isAvailable: true,
      owner: { name: 'Fatima Yusuf', rating: 4.5, verified: true }
    }
  ];

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.allCars = [...this.mockCars];
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  applyFilters(): void {
    let filtered = [...this.allCars];

    // Location filter
    if (this.filters.location) {
      filtered = filtered.filter(car => car.location === this.filters.location);
    }

    // Car type filter
    if (this.filters.carType !== 'all') {
      filtered = filtered.filter(car => car.type === this.filters.carType);
    }

    // Price range filter
    filtered = filtered.filter(car => 
      car.pricePerDay >= this.filters.priceRange.min && 
      car.pricePerDay <= this.filters.priceRange.max
    );

    // Sort results
    this.sortCars(filtered);

    this.filteredCars = filtered;
  }

  sortCars(cars: Car[]): void {
    switch (this.filters.sortBy) {
      case 'price-low':
        cars.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-high':
        cars.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        cars.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        cars.sort((a, b) => b.year - a.year);
        break;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      location: '',
      startDate: '',
      endDate: '',
      carType: 'all',
      priceRange: {
        min: 0,
        max: 50000
      },
      sortBy: 'newest'
    };
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getStarRating(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  onViewDetails(carId: string): void {
    console.log('Navigating to car details for ID:', carId);
    this.router.navigate(['/car', carId]);
  }

  // Enhanced UI helper methods
  hasActiveFilters(): boolean {
    return this.filters.location !== '' || 
           this.filters.carType !== 'all' || 
           this.filters.priceRange.min > 0 || 
           this.filters.priceRange.max < 50000 ||
           this.filters.startDate !== '' ||
           this.filters.endDate !== '';
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filters.location) count++;
    if (this.filters.carType !== 'all') count++;
    if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 50000) count++;
    if (this.filters.startDate) count++;
    if (this.filters.endDate) count++;
    return count;
  }

  setPriceRange(min: number, max: number): void {
    this.filters.priceRange.min = min;
    this.filters.priceRange.max = max;
    this.applyFilters();
  }
} 
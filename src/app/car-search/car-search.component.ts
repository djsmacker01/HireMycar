import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

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
  isFavorite?: boolean;
  distance?: number;
  lastBooked?: string;
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
  searchQuery: string;
  features: string[];
  rating: number;
  availability: 'all' | 'available' | 'instant';
}

export type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Luxury' | 'Van' | 'Truck';
export type SortOption = 'price-low' | 'price-high' | 'rating' | 'newest' | 'distance' | 'popularity';

@Component({
  selector: 'app-car-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.scss']
})
export class CarSearchComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
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
    sortBy: 'newest',
    searchQuery: '',
    features: [],
    rating: 0,
    availability: 'all'
  };

  // Available options
  locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Kaduna'];
  carTypes: CarType[] = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Van', 'Truck'];
  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'popularity', label: 'Most Popular' }
  ];
  
  availableFeatures = ['Automatic', 'AC', 'Bluetooth', 'Backup Camera', '4WD', 'Leather Seats', 'Premium Sound', 'Navigation', 'Hybrid', 'Sport Mode', 'Compact', '7 Seats', 'Family Friendly', 'Durable', 'Fuel Efficient', 'Premium Package', 'Panoramic Roof'];

  // Data
  allCars: Car[] = [];
  filteredCars: Car[] = [];
  isLoading = false;
  showFilters = false;
  viewMode: 'grid' | 'list' = 'grid';
  selectedCars: Set<string> = new Set();
  showMap = false;
  searchSuggestions: string[] = [];
  showSuggestions = false;

  // Animation states
  carCards: { [key: string]: boolean } = {};
  filterAnimation = false;
  loadingAnimation = false;
  filterPresets = [
    { 
      name: 'Budget Friendly', 
      filters: { 
        location: '', startDate: '', endDate: '', carType: 'all' as const, 
        priceRange: { min: 0, max: 20000 }, sortBy: 'newest' as const, 
        searchQuery: '', features: [], rating: 0, availability: 'all' as const 
      } 
    },
    { 
      name: 'Luxury Cars', 
      filters: { 
        location: '', startDate: '', endDate: '', carType: 'Luxury' as const, 
        priceRange: { min: 30000, max: 100000 }, sortBy: 'newest' as const, 
        searchQuery: '', features: [], rating: 0, availability: 'all' as const 
      } 
    },
    { 
      name: 'Family SUVs', 
      filters: { 
        location: '', startDate: '', endDate: '', carType: 'SUV' as const, 
        priceRange: { min: 0, max: 50000 }, sortBy: 'newest' as const, 
        searchQuery: '', features: ['7 Seats', 'Family Friendly'], rating: 0, availability: 'all' as const 
      } 
    },
    { 
      name: 'City Commuters', 
      filters: { 
        location: '', startDate: '', endDate: '', carType: 'all' as const, 
        priceRange: { min: 0, max: 25000 }, sortBy: 'newest' as const, 
        searchQuery: '', features: ['Compact', 'Fuel Efficient'], rating: 0, availability: 'all' as const 
      } 
    },
    { 
      name: 'Weekend Warriors', 
      filters: { 
        location: '', startDate: '', endDate: '', carType: 'SUV' as const, 
        priceRange: { min: 0, max: 50000 }, sortBy: 'newest' as const, 
        searchQuery: '', features: ['4WD', 'Durable'], rating: 0, availability: 'all' as const 
      } 
    }
  ];
  activePreset: string | null = null;
  showFilterPresets = false;
  filterHistory: SearchFilters[] = [];
  canUndoFilter = false;
  canRedoFilter = false;

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
      owner: { name: 'John Doe', rating: 4.9, verified: true },
      distance: 2.5,
      lastBooked: '2024-01-15'
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
      owner: { name: 'Sarah Wilson', rating: 4.7, verified: true },
      distance: 5.2,
      lastBooked: '2024-01-10'
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
      owner: { name: 'Michael Chen', rating: 5.0, verified: true },
      distance: 1.8,
      lastBooked: '2024-01-20'
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
      owner: { name: 'David Okonkwo', rating: 4.6, verified: true },
      distance: 8.7,
      lastBooked: '2024-01-12'
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
      owner: { name: 'Grace Adebayo', rating: 4.5, verified: true },
      distance: 3.1,
      lastBooked: '2024-01-18'
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
      owner: { name: 'Emma Thompson', rating: 4.8, verified: true },
      distance: 4.3,
      lastBooked: '2024-01-14'
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
      owner: { name: 'Alex Johnson', rating: 5.0, verified: true },
      distance: 2.1,
      lastBooked: '2024-01-22'
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
      owner: { name: 'Ahmed Hassan', rating: 4.4, verified: true },
      distance: 12.5,
      lastBooked: '2024-01-08'
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
      owner: { name: 'Oluwaseun Adeyemi', rating: 4.7, verified: true },
      distance: 6.8,
      lastBooked: '2024-01-16'
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
      owner: { name: 'Patricia Eze', rating: 4.6, verified: true },
      distance: 9.2,
      lastBooked: '2024-01-11'
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
      owner: { name: 'Robert Williams', rating: 4.9, verified: true },
      distance: 4.7,
      lastBooked: '2024-01-19'
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
      owner: { name: 'Fatima Yusuf', rating: 4.5, verified: true },
      distance: 15.3,
      lastBooked: '2024-01-09'
    }
  ];

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCars();
    this.generateSearchSuggestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.filters.searchQuery = query;
        this.applyFilters();
      });
  }

  loadCars(): void {
    this.isLoading = true;
    this.loadingAnimation = true;
    
    // Simulate API call with loading animation
    setTimeout(() => {
      this.allCars = [...this.mockCars];
      this.applyFilters();
      this.isLoading = false;
      this.loadingAnimation = false;
      
      // Animate car cards in
      setTimeout(() => {
        this.filteredCars.forEach(car => {
          this.carCards[car.id] = true;
        });
      }, 100);
    }, 1500);
  }

  applyFilters(): void {
    let filtered = [...this.allCars];

    // Search query filter
    if (this.filters.searchQuery) {
      const query = this.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.location.toLowerCase().includes(query) ||
        car.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

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

    // Rating filter
    if (this.filters.rating > 0) {
      filtered = filtered.filter(car => car.rating >= this.filters.rating);
    }

    // Features filter
    if (this.filters.features.length > 0) {
      filtered = filtered.filter(car => 
        this.filters.features.every(feature => car.features.includes(feature))
      );
    }

    // Availability filter
    if (this.filters.availability !== 'all') {
      filtered = filtered.filter(car => {
        if (this.filters.availability === 'available') {
          return car.isAvailable;
        } else if (this.filters.availability === 'instant') {
          return car.isAvailable && car.lastBooked;
        }
        return true;
      });
    }

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
      case 'distance':
        cars.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'popularity':
        cars.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
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
      sortBy: 'newest',
      searchQuery: '',
      features: [],
      rating: 0,
      availability: 'all'
    };
    this.selectedCars.clear();
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleMapView(): void {
    this.showMap = !this.showMap;
  }

  toggleFavorite(carId: string): void {
    const car = this.allCars.find(c => c.id === carId);
    if (car) {
      car.isFavorite = !car.isFavorite;
      // TODO: Implement API call to save favorite
      console.log('Toggle favorite for car:', carId, car.isFavorite);
    }
  }

  toggleCarSelection(carId: string): void {
    if (this.selectedCars.has(carId)) {
      this.selectedCars.delete(carId);
    } else {
      this.selectedCars.add(carId);
    }
  }

  selectAllCars(): void {
    this.filteredCars.forEach(car => {
      this.selectedCars.add(car.id);
    });
  }

  deselectAllCars(): void {
    this.selectedCars.clear();
  }

  getStarRating(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  formatPrice(price: number): string {
    return `₦${price.toLocaleString()}`;
  }

  formatDistance(distance?: number): string {
    if (!distance) return '';
    return `${distance.toFixed(1)} km away`;
  }

  onViewDetails(carId: string): void {
    this.router.navigate(['/car', carId]);
  }

  // Enhanced UI helper methods
  hasActiveFilters(): boolean {
    return this.filters.location !== '' || 
           this.filters.carType !== 'all' || 
           this.filters.priceRange.min > 0 || 
           this.filters.priceRange.max < 50000 ||
           this.filters.startDate !== '' ||
           this.filters.endDate !== '' ||
           this.filters.searchQuery !== '' ||
           this.filters.features.length > 0 ||
           this.filters.rating > 0 ||
           this.filters.availability !== 'all';
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filters.location) count++;
    if (this.filters.carType !== 'all') count++;
    if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 50000) count++;
    if (this.filters.startDate) count++;
    if (this.filters.endDate) count++;
    if (this.filters.searchQuery) count++;
    if (this.filters.features.length > 0) count++;
    if (this.filters.rating > 0) count++;
    if (this.filters.availability !== 'all') count++;
    return count;
  }

  setPriceRange(min: number, max: number): void {
    this.filters.priceRange.min = min;
    this.filters.priceRange.max = max;
    this.applyFilters();
  }

  toggleFeature(feature: string): void {
    const index = this.filters.features.indexOf(feature);
    if (index > -1) {
      this.filters.features.splice(index, 1);
    } else {
      this.filters.features.push(feature);
    }
    this.applyFilters();
  }

  isFeatureSelected(feature: string): boolean {
    return this.filters.features.includes(feature);
  }

  generateSearchSuggestions(): void {
    this.searchSuggestions = [
      'Toyota Camry',
      'Honda CR-V',
      'Luxury cars',
      'SUV vehicles',
      'Automatic transmission',
      'AC available',
      'Lagos location',
      'Abuja cars',
      'Budget friendly',
      'High rated'
    ];
  }

  selectSuggestion(suggestion: string): void {
    this.filters.searchQuery = suggestion;
    this.showSuggestions = false;
    this.applyFilters();
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  // Dynamic Filter Methods
  applyFilterPreset(presetName: string): void {
    const preset = this.filterPresets.find(p => p.name === presetName);
    if (preset) {
      this.saveFilterState();
      this.activePreset = presetName;
      this.filters = { ...this.filters, ...preset.filters };
      this.applyFilters();
      this.showFilterPresets = false;
    }
  }

  clearActivePreset(): void {
    this.activePreset = null;
    this.clearFilters();
  }

  saveFilterState(): void {
    this.filterHistory.push({ ...this.filters });
    if (this.filterHistory.length > 10) {
      this.filterHistory.shift();
    }
    this.updateUndoRedoState();
  }

  undoFilter(): void {
    if (this.filterHistory.length > 0) {
      const previousState = this.filterHistory.pop();
      if (previousState) {
        this.filters = { ...previousState };
        this.applyFilters();
        this.updateUndoRedoState();
      }
    }
  }

  updateUndoRedoState(): void {
    this.canUndoFilter = this.filterHistory.length > 0;
    this.canRedoFilter = false; // For simplicity, we'll implement redo later
  }

  toggleFilterPresets(): void {
    this.showFilterPresets = !this.showFilterPresets;
  }

  // Real-time filter updates
  onFilterChange(): void {
    this.filterAnimation = true;
    this.saveFilterState();
    setTimeout(() => {
      this.applyFilters();
      this.filterAnimation = false;
    }, 300);
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onQuickFilterChange(filterType: string, value: any): void {
    this.saveFilterState();
    switch (filterType) {
      case 'location': {
        this.filters.location = value;
        break;
      }
      case 'carType': {
        this.filters.carType = value;
        break;
      }
      case 'priceRange': {
        this.filters.priceRange = value;
        break;
      }
      case 'rating': {
        this.filters.rating = value;
        break;
      }
      case 'availability': {
        this.filters.availability = value;
        break;
      }
    }
    this.applyFilters();
  }

  // Dynamic price range slider
  updatePriceRange(min: number, max: number): void {
    this.filters.priceRange.min = min;
    this.filters.priceRange.max = max;
    this.applyFilters();
  }

  // Feature toggle with animation
  toggleFeatureWithAnimation(feature: string): void {
    this.saveFilterState();
    this.toggleFeature(feature);
    
    // Add visual feedback
    const featureBtn = document.querySelector(`[data-feature="${feature}"]`);
    if (featureBtn) {
      featureBtn.classList.add('feature-toggled');
      setTimeout(() => {
        featureBtn.classList.remove('feature-toggled');
      }, 300);
    }
  }

  // Rating filter with visual feedback
  setRatingFilter(rating: number): void {
    this.saveFilterState();
    this.filters.rating = rating;
    this.applyFilters();
  }

  // Availability filter with real-time updates
  setAvailabilityFilter(availability: 'all' | 'available' | 'instant'): void {
    this.saveFilterState();
    this.filters.availability = availability;
    this.applyFilters();
  }

  // Dynamic filter suggestions based on current results
  getFilterSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (this.filteredCars.length === 0) {
      suggestions.push('Try expanding your price range');
      suggestions.push('Check different locations');
      suggestions.push('Try different car types');
    } else if (this.filteredCars.length < 5) {
      suggestions.push('Try removing some filters');
      suggestions.push('Expand your search area');
    }
    
    return suggestions;
  }

  // Filter statistics
  getFilterStats(): { total: number; filtered: number; percentage: number } {
    const total = this.allCars.length;
    const filtered = this.filteredCars.length;
    const percentage = total > 0 ? Math.round((filtered / total) * 100) : 0;
    
    return { total, filtered, percentage };
  }

  getSelectedCarsCount(): number {
    return this.selectedCars.size;
  }

  getTotalSelectedPrice(): number {
    return this.filteredCars
      .filter(car => this.selectedCars.has(car.id))
      .reduce((total, car) => total + car.pricePerDay, 0);
  }

  // Animation helpers
  getCardAnimationDelay(index: number): string {
    return `${index * 0.1}s`;
  }

  isCardVisible(carId: string): boolean {
    return this.carCards[carId] || false;
  }
} 
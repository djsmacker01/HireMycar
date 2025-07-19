import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Type Definitions
interface CarListing {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  transmission: string;
  fuelType: string;
  seats: number;
  features: CarFeatures[];
  images: File[];
  pricing: PricingData;
  location: string;
  availability: Date[];
}

type CarFeatures = 'AC' | 'GPS' | 'Bluetooth' | 'USB Port' | 'Reverse Camera' | 'Parking Sensors' | 'Heated Seats' | 'Sunroof';

interface PricingData {
  dailyRate: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
}

interface StepData {
  title: string;
  description: string;
  completed: boolean;
}

interface FeatureInfo {
  name: CarFeatures;
  icon: string;
  description: string;
  impact: 'premium' | 'standard' | 'basic';
}

@Component({
  selector: 'app-add-car-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-car-listing.component.html',
  styleUrls: ['./add-car-listing.component.scss']
})
export class AddCarListingComponent implements OnInit {
  carListingForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  isSubmitting = false;
  isDraftSaved = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';

  // Car data for dropdowns
  carMakes = [
    'Toyota', 'Honda', 'Lexus', 'Hyundai', 'Nissan', 'Ford', 
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Kia', 'Mazda'
  ];

  carModels: { [key: string]: string[] } = {
    'Toyota': ['Camry', 'Corolla', 'Hilux', 'Land Cruiser', 'Highlander', 'RAV4'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
    'Lexus': ['ES', 'IS', 'RX', 'NX', 'LS', 'GS'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Maxima'],
    'Ford': ['Focus', 'Fusion', 'Escape', 'Explorer', 'F-150'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', '1 Series'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE'],
    'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
    'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Atlas', 'Jetta'],
    'Kia': ['Forte', 'Optima', 'Sportage', 'Sorento', 'Rio'],
    'Mazda': ['3', '6', 'CX-5', 'CX-9', 'CX-30']
  };

  years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);
  
  transmissionTypes = ['Automatic', 'Manual'];
  fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  seatOptions = Array.from({ length: 8 }, (_, i) => i + 2);
  
  carFeatures: FeatureInfo[] = [
    { name: 'AC', icon: '❄️', description: 'Air Conditioning', impact: 'standard' },
    { name: 'GPS', icon: '🧭', description: 'GPS Navigation', impact: 'premium' },
    { name: 'Bluetooth', icon: '📱', description: 'Bluetooth Connectivity', impact: 'standard' },
    { name: 'USB Port', icon: '🔌', description: 'USB Charging Ports', impact: 'basic' },
    { name: 'Reverse Camera', icon: '📹', description: 'Reverse Camera', impact: 'premium' },
    { name: 'Parking Sensors', icon: '🚗', description: 'Parking Sensors', impact: 'premium' },
    { name: 'Heated Seats', icon: '🔥', description: 'Heated Seats', impact: 'premium' },
    { name: 'Sunroof', icon: '☀️', description: 'Sunroof', impact: 'premium' }
  ];

  locations = [
    'Lagos Mainland', 'Lagos Island', 'Abuja', 'Port Harcourt', 'Kano'
  ];

  // Step tracking
  steps: StepData[] = [
    { title: 'Car Details', description: 'Basic car information', completed: false },
    { title: 'Photos', description: 'Upload car images', completed: false },
    { title: 'Pricing', description: 'Set rates and availability', completed: false },
    { title: 'Review', description: 'Review and submit', completed: false }
  ];

  // Image handling
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  dragOver = false;
  isUploading = false;

  // Dynamic pricing
  suggestedDailyRate = 0;
  marketAverage = 0;
  featureMultiplier = 1;

  // Interactive elements
  selectedFeatures: CarFeatures[] = [];
  formCompletionPercentage = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadDraft();
    this.setupFormListeners();
  }

  private initializeForm(): void {
    this.carListingForm = this.fb.group({
      // Step 1: Car Details
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,3}\s?\d{2,3}\s?[A-Z]{1,3}\s?\d{2,4}$/)]],
      color: ['', Validators.required],
      transmission: ['', Validators.required],
      fuelType: ['', Validators.required],
      seats: ['', Validators.required],
      features: this.fb.array([]),

      // Step 3: Pricing & Availability
      dailyRate: ['', [Validators.required, Validators.min(1000)]],
      weeklyDiscount: [0, [Validators.min(0), Validators.max(50)]],
      monthlyDiscount: [0, [Validators.min(0), Validators.max(50)]],
      location: ['', Validators.required],
      availability: this.fb.array([])
    });

    // Watch for make changes to update models
    this.carListingForm.get('make')?.valueChanges.subscribe(make => {
      this.carListingForm.patchValue({ model: '' });
      this.updateSuggestedPricing();
    });

    this.carListingForm.get('model')?.valueChanges.subscribe(() => {
      this.updateSuggestedPricing();
    });

    this.carListingForm.get('year')?.valueChanges.subscribe(() => {
      this.updateSuggestedPricing();
    });

    this.carListingForm.get('dailyRate')?.valueChanges.subscribe(() => {
      this.updateFormCompletion();
    });
  }

  private setupFormListeners(): void {
    // Update form completion percentage
    this.carListingForm.valueChanges.subscribe(() => {
      this.updateFormCompletion();
    });
  }

  private updateFormCompletion(): void {
    const totalFields = 10; // Total required fields
    let completedFields = 0;

    // Check each required field
    const requiredFields = ['make', 'model', 'year', 'licensePlate', 'color', 'transmission', 'fuelType', 'seats', 'dailyRate', 'location'];
    requiredFields.forEach(field => {
      if (this.carListingForm.get(field)?.valid) {
        completedFields++;
      }
    });

    // Add photo completion
    if (this.uploadedImages.length >= 4) {
      completedFields++;
    }

    this.formCompletionPercentage = Math.round((completedFields / totalFields) * 100);
  }

  private updateSuggestedPricing(): void {
    const make = this.carListingForm.get('make')?.value;
    const model = this.carListingForm.get('model')?.value;
    const year = this.carListingForm.get('year')?.value;

    if (make && model && year) {
      // Calculate base price based on make, model, and year
      const basePrice = this.calculateBasePrice(make, model, year);
      
      // Apply feature multiplier
      const featureCount = this.selectedFeatures.length;
      this.featureMultiplier = 1 + (featureCount * 0.05); // 5% increase per feature
      
      this.suggestedDailyRate = Math.round(basePrice * this.featureMultiplier);
      this.marketAverage = Math.round(basePrice * 0.9); // 90% of base price as market average
      
      // Auto-fill daily rate if empty
      if (!this.carListingForm.get('dailyRate')?.value) {
        this.carListingForm.patchValue({ dailyRate: this.suggestedDailyRate });
      }
    }
  }

  private calculateBasePrice(make: string, model: string, year: number): number {
    // Base prices for different makes (in Naira)
    const makeBasePrices: { [key: string]: number } = {
      'Toyota': 25000,
      'Honda': 22000,
      'Lexus': 35000,
      'Hyundai': 20000,
      'Nissan': 23000,
      'Ford': 24000,
      'BMW': 40000,
      'Mercedes-Benz': 45000,
      'Audi': 38000,
      'Volkswagen': 22000,
      'Kia': 21000,
      'Mazda': 23000
    };

    let basePrice = makeBasePrices[make] || 25000;
    
    // Adjust for year (newer cars cost more)
    const currentYear = new Date().getFullYear();
    const ageFactor = Math.max(0.7, 1 - ((currentYear - year) * 0.05));
    basePrice = Math.round(basePrice * ageFactor);
    
    return basePrice;
  }

  // Step Navigation
  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.steps[this.currentStep - 1].completed = true;
      this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
      this.saveDraft();
      this.showStepTransition();
    } else {
      this.showValidationError();
    }
  }

  previousStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
    this.showStepTransition();
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.steps[step - 2]?.completed) {
      this.currentStep = step;
      this.showStepTransition();
    }
  }

  private showStepTransition(): void {
    // Add visual feedback for step transitions
    const stepContent = document.querySelector('.step-content');
    if (stepContent) {
      stepContent.classList.add('step-transition');
      setTimeout(() => {
        stepContent.classList.remove('step-transition');
      }, 300);
    }
  }

  private showValidationError(): void {
    this.showErrorMessage = true;
    this.errorMessage = 'Please complete all required fields before proceeding.';
    setTimeout(() => {
      this.showErrorMessage = false;
    }, 3000);
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.isStep1Valid();
      case 2:
        return this.isStep2Valid();
      case 3:
        return this.isStep3Valid();
      case 4:
        return this.isStep4Valid();
      default:
        return false;
    }
  }

  private isStep1Valid(): boolean {
    const step1Controls = ['make', 'model', 'year', 'licensePlate', 'color', 'transmission', 'fuelType', 'seats'];
    return step1Controls.every(control => this.carListingForm.get(control)?.valid);
  }

  private isStep2Valid(): boolean {
    return this.uploadedImages.length >= 4;
  }

  private isStep3Valid(): boolean {
    const step3Controls = ['dailyRate', 'location'];
    return step3Controls.every(control => this.carListingForm.get(control)?.valid);
  }

  private isStep4Valid(): boolean {
    return this.carListingForm.valid && this.uploadedImages.length >= 4;
  }

  // Feature handling
  toggleFeature(feature: CarFeatures): void {
    const index = this.selectedFeatures.indexOf(feature);
    
    if (index > -1) {
      this.selectedFeatures.splice(index, 1);
    } else {
      this.selectedFeatures.push(feature);
    }
    
    this.carListingForm.patchValue({ features: this.selectedFeatures });
    this.updateSuggestedPricing();
    
    // Show feature selection feedback
    this.showFeatureFeedback(feature, index === -1);
  }

  isFeatureSelected(feature: CarFeatures): boolean {
    return this.selectedFeatures.includes(feature);
  }

  getFeatureInfo(feature: CarFeatures): FeatureInfo | undefined {
    return this.carFeatures.find(f => f.name === feature);
  }

  private showFeatureFeedback(feature: CarFeatures, added: boolean): void {
    const message = added ? `Added ${feature}` : `Removed ${feature}`;
    // In a real app, this would be a toast notification
    console.log(message);
  }

  // Image handling
  onFileSelected(event: any): void {
    const files = event.target.files;
    this.addImages(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.addImages(files);
    }
  }

  private addImages(files: FileList): void {
    this.isUploading = true;
    
    // Simulate upload delay
    setTimeout(() => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          this.uploadedImages.push(file);
          this.createImagePreview(file);
        }
      }
      this.isUploading = false;
      this.updateFormCompletion();
    }, 500);
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
    this.updateFormCompletion();
  }

  // Draft functionality
  saveDraft(): void {
    const draftData = {
      formData: this.carListingForm.value,
      images: this.uploadedImages,
      currentStep: this.currentStep,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('carListingDraft', JSON.stringify(draftData));
    this.isDraftSaved = true;
    
    setTimeout(() => {
      this.isDraftSaved = false;
    }, 2000);
  }

  loadDraft(): void {
    const draft = localStorage.getItem('carListingDraft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        this.carListingForm.patchValue(draftData.formData);
        this.currentStep = draftData.currentStep || 1;
        this.selectedFeatures = draftData.formData.features || [];
        
        // Update step completion
        this.steps.forEach((step, index) => {
          step.completed = index < this.currentStep - 1;
        });
        
        this.updateSuggestedPricing();
        this.updateFormCompletion();
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }

  clearDraft(): void {
    localStorage.removeItem('carListingDraft');
  }

  // Form submission
  async submitListing(): Promise<void> {
    if (!this.carListingForm.valid || this.uploadedImages.length < 4) {
      this.showErrorMessage = true;
      this.errorMessage = 'Please complete all required fields and upload at least 4 photos.';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
      return;
    }

    this.isSubmitting = true;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const listingData: CarListing = {
        ...this.carListingForm.value,
        images: this.uploadedImages,
        availability: [] // Would be populated from calendar
      };

      console.log('Car listing submitted:', listingData);
      
      // Clear draft and reset form
      this.clearDraft();
      this.carListingForm.reset();
      this.uploadedImages = [];
      this.imagePreviewUrls = [];
      this.selectedFeatures = [];
      this.currentStep = 1;
      this.steps.forEach(step => step.completed = false);
      this.suggestedDailyRate = 0;
      this.marketAverage = 0;
      this.featureMultiplier = 1;

      // Show success message
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting listing:', error);
      this.showErrorMessage = true;
      this.errorMessage = 'Error submitting listing. Please try again.';
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Utility methods
  getAvailableModels(): string[] {
    const make = this.carListingForm.get('make')?.value;
    return make ? this.carModels[make] || [] : [];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }

  getStepProgress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  getFeatureImpactClass(impact: string): string {
    switch (impact) {
      case 'premium': return 'feature-premium';
      case 'standard': return 'feature-standard';
      case 'basic': return 'feature-basic';
      default: return '';
    }
  }

  // Make Math available to template
  get Math() {
    return Math;
  }
} 
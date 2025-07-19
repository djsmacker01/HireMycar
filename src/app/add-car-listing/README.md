# Add Car Listing Component

A comprehensive multi-step wizard component for hosts to list their cars on HireMyCar.com.ng built with Angular 17+ standalone components.

## Features

### 🚗 **4-Step Multi-Step Wizard**
- **Step 1**: Car Details - Basic car information and features
- **Step 2**: Photo Upload - Drag-and-drop image upload with preview
- **Step 3**: Pricing & Availability - Set rates and location
- **Step 4**: Review & Submit - Final review and submission

### 📋 **Step 1: Car Details**
- **Dropdowns**: Make, Model, Year with realistic Nigerian car market options
- **Text Inputs**: License Plate (with Nigerian format validation), Color
- **Select Dropdowns**: Transmission Type, Fuel Type, Number of Seats (2-9)
- **Features Checklist**: AC, GPS, Bluetooth, USB Port, Reverse Camera, Parking Sensors, Heated Seats, Sunroof
- **Dynamic Model Loading**: Models update based on selected make

### 📸 **Step 2: Photo Upload**
- **Drag-and-Drop**: Accepts 4-6 images with visual feedback
- **Image Preview**: Thumbnail grid with remove functionality
- **Validation**: Minimum 4 photos required to proceed
- **File Handling**: Supports common image formats (JPEG, PNG, etc.)

### 💰 **Step 3: Pricing & Availability**
- **Daily Rate**: Required field with minimum ₦1,000 validation
- **Optional Discounts**: Weekly and Monthly discount percentages (0-50%)
- **Location Selection**: Nigerian cities (Lagos Mainland, Lagos Island, Abuja, Port Harcourt, Kano)
- **Availability Placeholder**: Calendar functionality for future implementation

### ✅ **Step 4: Review & Submit**
- **Summary Cards**: Car info, features, photos, pricing details
- **Edit Functionality**: Each section has "Edit" button to return to specific step
- **Submit Options**: "Submit Listing" and "Save as Draft" buttons
- **Form Validation**: Complete validation before submission

## Technical Implementation

### Component Structure
```
add-car-listing/
├── add-car-listing.component.ts    # Main component logic
├── add-car-listing.component.html  # Multi-step wizard template
├── add-car-listing.component.scss  # Nigerian-themed styles
└── README.md                       # Documentation
```

### TypeScript Interfaces
```typescript
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
```

### Key Features

#### **Car Data**
- **12 Popular Makes**: Toyota, Honda, Lexus, Hyundai, Nissan, Ford, BMW, Mercedes-Benz, Audi, Volkswagen, Kia, Mazda
- **Dynamic Models**: Each make has 5-6 popular models
- **25 Years**: Current year back to 1999
- **Nigerian License Plate Validation**: Pattern matching for Nigerian format

#### **Form Validation**
- **Step-by-Step Validation**: Each step validates before proceeding
- **Real-time Feedback**: Error messages appear immediately
- **Required Fields**: All essential fields are marked and validated
- **Pattern Validation**: License plate format, discount percentages

#### **Image Handling**
- **Drag-and-Drop**: Visual feedback during drag operations
- **Multiple File Selection**: Browse and select multiple images
- **Preview Generation**: Automatic thumbnail creation
- **Remove Functionality**: Individual image removal
- **File Type Validation**: Only image files accepted

#### **Draft Functionality**
- **Auto-Save**: Automatic draft saving on step progression
- **Local Storage**: Drafts persist in browser localStorage
- **Load Draft**: Restore previous session on component load
- **Clear Draft**: Remove draft after successful submission

### Key Methods
- `initializeForm()`: Sets up reactive form with all validators
- `nextStep()` / `previousStep()`: Step navigation with validation
- `toggleFeature()`: Handle feature selection
- `addImages()`: Process uploaded image files
- `saveDraft()` / `loadDraft()`: Draft management
- `submitListing()`: Form submission with mock API call

## Form Validation Rules

### Step 1: Car Details
- **Make**: Required
- **Model**: Required (enabled only after make selection)
- **Year**: Required
- **License Plate**: Required, Nigerian format pattern
- **Color**: Required
- **Transmission**: Required
- **Fuel Type**: Required
- **Seats**: Required

### Step 2: Photo Upload
- **Minimum Photos**: 4 images required
- **File Types**: Image files only (JPEG, PNG, etc.)
- **Maximum Photos**: 6 images recommended

### Step 3: Pricing & Availability
- **Daily Rate**: Required, minimum ₦1,000
- **Weekly Discount**: Optional, 0-50%
- **Monthly Discount**: Optional, 0-50%
- **Location**: Required

### Step 4: Review
- **Complete Form**: All previous steps must be valid
- **Minimum Photos**: At least 4 photos uploaded

## UI/UX Features

### **Nigerian Color Scheme**
- Primary Red: `#dc2626`
- Light Red: `#fef2f2`
- Accent Blue: `#2563eb`
- Success Green: `#10b981`
- Error Red: `#ef4444`

### **Responsive Design**
- **Desktop (768px+)**: Two-column grid layout
- **Mobile (< 768px)**: Single-column stacked layout
- **Small Mobile (< 480px)**: Optimized touch targets

### **Progress Tracking**
- **Visual Progress Bar**: Shows completion percentage
- **Step Indicators**: Clickable step navigation
- **Completion States**: Visual feedback for completed steps

### **Accessibility**
- **ARIA Labels**: Proper form labeling
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear focus states
- **Color Contrast**: WCAG compliant color ratios

## Usage

### Route Access
Navigate to `/add-car-listing` to access the component.

### Form Flow
1. **Step 1**: Fill car details and select features
2. **Step 2**: Upload 4+ photos of the car
3. **Step 3**: Set pricing and location
4. **Step 4**: Review and submit

### Draft Management
- Drafts save automatically when moving between steps
- Drafts persist across browser sessions
- Clear drafts after successful submission

## Mock Data

### Car Makes & Models
```typescript
carMakes = ['Toyota', 'Honda', 'Lexus', 'Hyundai', 'Nissan', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Kia', 'Mazda'];

carModels = {
  'Toyota': ['Camry', 'Corolla', 'Hilux', 'Land Cruiser', 'Highlander', 'RAV4'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
  // ... more models for each make
};
```

### Nigerian Locations
```typescript
locations = ['Lagos Mainland', 'Lagos Island', 'Abuja', 'Port Harcourt', 'Kano'];
```

## Future Enhancements

### **Calendar Integration**
- Date range picker for availability
- Blackout dates for unavailable periods
- Recurring availability patterns

### **Payment Integration**
- Paystack integration for listing fees
- Subscription-based listing options
- Featured listing upgrades

### **Advanced Features**
- Multiple car listings per host
- Bulk photo upload
- Advanced pricing models
- Location-based pricing

### **Data Management**
- Real API endpoints
- Image upload to cloud storage
- State management with NgRx
- Real-time validation

## Dependencies
- Angular 17+ (standalone components)
- Reactive Forms
- Angular Router
- SCSS for styling

## Browser Support
- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes
- Local storage for draft functionality 
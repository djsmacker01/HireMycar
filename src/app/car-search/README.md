# Car Search Component

A comprehensive car search and browse page component for HireMyCar.com.ng with advanced filtering and responsive design.

## Features

- **Advanced Search Filters**:
  - Location dropdown (Lagos, Abuja, Port Harcourt, etc.)
  - Car type filter (Sedan, SUV, Hatchback, Luxury, Van, Truck)
  - Price range inputs (min/max)
  - Date range picker (start/end dates)
  - Sort options (Price low-high, Rating, Newest)

- **Responsive Car Grid**:
  - Mobile-first responsive design
  - Card-based layout with hover effects
  - Car images with verified owner badges
  - Star ratings and review counts
  - Feature tags and pricing display

- **User Experience**:
  - Loading states with spinner animation
  - Empty states with helpful messaging
  - Mobile-friendly filter sidebar
  - Real-time search results count
  - Professional Nigerian color scheme

## Component Structure

```
car-search/
├── car-search.component.ts      # TypeScript component with interfaces
├── car-search.component.html    # HTML template
├── car-search.component.scss    # SCSS styles
└── README.md                    # This documentation
```

## Interfaces

- `Car`: Complete car information including owner details
- `SearchFilters`: All search parameters and filters
- `CarType`: TypeScript union type for car categories
- `SortOption`: Available sorting options

## Mock Data

The component includes 12 sample cars with realistic data:
- Various car makes and models (Toyota, Honda, Mercedes, BMW, etc.)
- Different locations across Nigeria
- Realistic pricing in Nigerian Naira (₦)
- Star ratings and review counts
- Feature lists and owner information

## Usage

Access the car search page at `/search` route. The component is automatically loaded when navigating from the landing page's "Browse Available Cars" button.

## Responsive Design

- **Desktop**: Sidebar filters + main content grid
- **Tablet**: Collapsible filter sidebar
- **Mobile**: Full-screen filter overlay with hamburger menu

## Future Enhancements

- Add car details page navigation
- Implement real API integration
- Add map view option
- Include more filter options (transmission, fuel type, etc.)
- Add wishlist/favorites functionality
- Implement booking flow integration 
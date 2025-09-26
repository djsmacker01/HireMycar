# Car Listing Functionality Test Guide

## Prerequisites
1. Run the SQL scripts in Supabase:
   - `add-car-fields.sql` - Adds missing fields to cars table
   - `setup-car-storage.sql` - Sets up storage bucket for car images

2. Ensure user is authenticated and has a profile

## Test Steps

### 1. Access Add Car Listing Page
- Navigate to `/add-car-listing`
- Should redirect to login if not authenticated
- Should show the car listing form if authenticated

### 2. Fill Out Car Details (Step 1)
- Select a car make (e.g., Toyota)
- Select a car model (e.g., Camry)
- Choose a year (e.g., 2020)
- Enter license plate (e.g., ABC123)
- Select color (e.g., White)
- Choose transmission (Automatic/Manual)
- Select fuel type (Petrol/Diesel/Hybrid/Electric)
- Choose number of seats (2-8)
- Select features (AC, GPS, Bluetooth, etc.)

### 3. Upload Car Images (Step 2)
- Upload at least 4 images
- Images should show previews
- Should validate minimum 4 images required

### 4. Set Pricing and Location (Step 3)
- Enter daily rate (minimum ₦1,000)
- Set weekly discount (0-50%)
- Set monthly discount (0-50%)
- Enter location (e.g., "Lagos, Lagos" or "Victoria Island, Lagos")

### 5. Review and Submit (Step 4)
- Review all entered information
- Click "Submit Listing"
- Should show loading state
- Should upload images to Supabase Storage
- Should save car data to database
- Should show success message
- Should redirect to dashboard

## Expected Database Records

After successful submission, check the `cars` table in Supabase:

```sql
SELECT * FROM cars ORDER BY created_at DESC LIMIT 1;
```

Should contain:
- `owner_id` - Current user's profile ID
- `make`, `model`, `year`, `color`, `license_plate`
- `daily_rate`, `location`, `city`, `state`
- `images` - Array of image URLs
- `features` - Array of selected features
- `transmission`, `fuel_type`, `seats`
- `weekly_discount`, `monthly_discount`
- `is_available` - true
- `is_verified` - false

## Expected Storage Files

Check Supabase Storage bucket `car-images`:
- Should contain uploaded image files
- Files should be publicly accessible
- URLs should be stored in database

## Troubleshooting

### Common Issues:
1. **Authentication Error**: User not logged in
2. **Image Upload Error**: Storage bucket not configured
3. **Database Error**: Missing fields in cars table
4. **Validation Error**: Form not complete

### Debug Console Logs:
- "Add car listing component initialized"
- "User authenticated: true/false"
- "Starting car listing submission..."
- "Images uploaded successfully"
- "Car listing created successfully with ID: [uuid]"

## Success Criteria:
✅ User can access the form when authenticated
✅ All form validation works correctly
✅ Images upload to Supabase Storage
✅ Car data saves to database with correct owner_id
✅ Success message shows and redirects to dashboard
✅ Car appears in owner's dashboard

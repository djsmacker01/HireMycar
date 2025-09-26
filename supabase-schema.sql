-- HireMyCar Supabase Database Schema
-- Run this script in your Supabase SQL editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('renter', 'owner', 'admin')),
    phone_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cars table
CREATE TABLE IF NOT EXISTS cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    description TEXT,
    daily_rate DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
    renter_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing reviews table if they don't exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'status') THEN
        ALTER TABLE reviews ADD COLUMN status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
    
    -- Add helpful_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'helpful_count') THEN
        ALTER TABLE reviews ADD COLUMN helpful_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add reported_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reported_count') THEN
        ALTER TABLE reviews ADD COLUMN reported_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'admin_notes') THEN
        ALTER TABLE reviews ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'booking', 'payment', 'technical', 'feedback', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES user_profiles(id),
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Support ticket responses
CREATE TABLE IF NOT EXISTS support_ticket_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
    responder_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Management
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review helpfulness tracking
CREATE TABLE IF NOT EXISTS review_helpfulness (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Review reports
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_owner_id ON cars(owner_id);
CREATE INDEX IF NOT EXISTS idx_cars_location ON cars(city, state);
CREATE INDEX IF NOT EXISTS idx_cars_available ON cars(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- FAQ indexes
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for cars
DROP POLICY IF EXISTS "Anyone can view available cars" ON cars;
CREATE POLICY "Anyone can view available cars" ON cars
    FOR SELECT USING (is_available = true);

DROP POLICY IF EXISTS "Car owners can view their own cars" ON cars;
CREATE POLICY "Car owners can view their own cars" ON cars
    FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Car owners can insert their own cars" ON cars;
CREATE POLICY "Car owners can insert their own cars" ON cars
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Car owners can update their own cars" ON cars;
CREATE POLICY "Car owners can update their own cars" ON cars
    FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Car owners can delete their own cars" ON cars;
CREATE POLICY "Car owners can delete their own cars" ON cars
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = renter_id OR auth.uid() IN (
        SELECT owner_id FROM cars WHERE id = bookings.car_id
    ));

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = renter_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = renter_id OR auth.uid() IN (
        SELECT owner_id FROM cars WHERE id = bookings.car_id
    ));

-- RLS Policies for messages
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update messages they sent" ON messages;
CREATE POLICY "Users can update messages they sent" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for reviews
DROP POLICY IF EXISTS "Users can view reviews for their bookings" ON reviews;
CREATE POLICY "Users can view reviews for their bookings" ON reviews
    FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
CREATE POLICY "Users can create reviews for their bookings" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for support_tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for support_ticket_responses
DROP POLICY IF EXISTS "Users can view responses to their tickets" ON support_ticket_responses;
CREATE POLICY "Users can view responses to their tickets" ON support_ticket_responses
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM support_tickets WHERE id = ticket_id
    ));

DROP POLICY IF EXISTS "Users can create responses to their tickets" ON support_ticket_responses;
CREATE POLICY "Users can create responses to their tickets" ON support_ticket_responses
    FOR INSERT WITH CHECK (auth.uid() = responder_id);

-- RLS Policies for faqs (public read access)
DROP POLICY IF EXISTS "Anyone can view active FAQs" ON faqs;
CREATE POLICY "Anyone can view active FAQs" ON faqs
    FOR SELECT USING (is_active = true);

-- RLS Policies for review_helpfulness
DROP POLICY IF EXISTS "Users can view helpfulness for reviews" ON review_helpfulness;
CREATE POLICY "Users can view helpfulness for reviews" ON review_helpfulness
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create helpfulness votes" ON review_helpfulness;
CREATE POLICY "Users can create helpfulness votes" ON review_helpfulness
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own helpfulness votes" ON review_helpfulness;
CREATE POLICY "Users can update their own helpfulness votes" ON review_helpfulness
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for review_reports
DROP POLICY IF EXISTS "Users can create review reports" ON review_reports;
CREATE POLICY "Users can create review reports" ON review_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own reports" ON review_reports;
CREATE POLICY "Users can view their own reports" ON review_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'renter')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();




CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Function to generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current counter
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 4) AS INTEGER)), 0) + 1
    INTO counter
    FROM support_tickets
    WHERE ticket_number LIKE 'HMC%';
    
    -- Format as HMC + 6-digit number
    ticket_number := 'HMC' || LPAD(counter::TEXT, 6, '0');
    
    RETURN ticket_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average rating for a user
CREATE OR REPLACE FUNCTION calculate_user_rating(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT COALESCE(AVG(rating), 0)
    INTO avg_rating
    FROM reviews
    WHERE reviewee_id = user_uuid AND status = 'approved';
    
    RETURN ROUND(avg_rating, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to update review helpfulness count
CREATE OR REPLACE FUNCTION update_review_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
    -- Update helpful_count in reviews table
    UPDATE reviews 
    SET helpful_count = (
        SELECT COUNT(*) 
        FROM review_helpfulness 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
        AND is_helpful = true
    )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update helpfulness count
DROP TRIGGER IF EXISTS update_review_helpfulness_trigger ON review_helpfulness;
CREATE TRIGGER update_review_helpfulness_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_helpfulness
    FOR EACH ROW EXECUTE FUNCTION update_review_helpfulness();


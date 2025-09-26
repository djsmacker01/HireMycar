
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'transmission') THEN
        ALTER TABLE cars ADD COLUMN transmission TEXT;
    END IF;
END $$;

-- Add fuel_type field
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'fuel_type') THEN
        ALTER TABLE cars ADD COLUMN fuel_type TEXT;
    END IF;
END $$;

-- Add seats field
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'seats') THEN
        ALTER TABLE cars ADD COLUMN seats INTEGER;
    END IF;
END $$;

-- Add weekly_discount field
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'weekly_discount') THEN
        ALTER TABLE cars ADD COLUMN weekly_discount DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Add monthly_discount field
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'monthly_discount') THEN
        ALTER TABLE cars ADD COLUMN monthly_discount DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Add description field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'description') THEN
        ALTER TABLE cars ADD COLUMN description TEXT;
    END IF;
END $$;

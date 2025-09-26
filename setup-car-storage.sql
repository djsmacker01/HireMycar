

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images',
  'car-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for car-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images');

-- Allow public access to view car images
CREATE POLICY "Allow public access to view car images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');

-- Allow car owners to update their own images
CREATE POLICY "Allow car owners to update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'car-images');

-- Allow car owners to delete their own images
CREATE POLICY "Allow car owners to delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-images');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO public;

-- Create figures storage bucket with image MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'figures',
  'figures',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- RLS Policy: Allow authenticated users to upload figures
CREATE POLICY "Authenticated users can upload figures"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'figures');

-- RLS Policy: Allow anyone to view figures (public bucket for displaying in reports)
CREATE POLICY "Anyone can view figures"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'figures');

-- RLS Policy: Allow users to delete their own figures
CREATE POLICY "Users can delete their own figures"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'figures' AND auth.uid()::text = (storage.foldername(name))[1]);
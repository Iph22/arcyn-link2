-- Create Storage Bucket for File Uploads
-- This enables file sharing in messages

-- ============================================
-- STEP 1: Create Storage Bucket
-- ============================================

-- Insert the files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Set Up Storage Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'files' 
        AND auth.role() = 'authenticated'
    );

-- Allow anyone to view files (public bucket)
CREATE POLICY "Anyone can view files" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'files');

-- Allow users to delete their own files
-- Files should be organized in folders by user ID: files/{user_id}/{filename}
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- STEP 3: Configure Bucket Settings (Optional)
-- ============================================

-- Update bucket settings for file size limits and allowed mime types
UPDATE storage.buckets
SET 
    file_size_limit = 52428800, -- 50MB limit
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'text/plain',
        'text/csv'
    ]
WHERE id = 'files';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket created successfully!';
    RAISE NOTICE '📝 File uploads are now enabled';
    RAISE NOTICE '📝 Next: Run 20240106000000_create_indexes.sql';
END $$;

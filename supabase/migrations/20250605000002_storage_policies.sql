-- ============================================================
-- NouMarket – Storage Policies Migration
--
-- PRE-REQUISITE (manual dashboard step):
--   Supabase Dashboard → Storage → New bucket
--     Name:        listing-images
--     Public:      true
--     File limit:  5242880  (5 MB)
--     MIME types:  image/jpeg, image/png, image/webp
--
-- Once the bucket exists, run this file to add RLS policies
-- on storage.objects.
-- ============================================================

-- ── INSERT (upload) ──────────────────────────────────────────
-- Authenticated users may upload files ONLY to a folder named
-- after their own user-id:
--   listing-images/{user_id}/{listing_id}/{timestamp}-{filename}
-- This prevents any user from overwriting another user's photos.
create policy "storage: authenticated upload to own folder"
  on storage.objects
  for insert
  with check (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── SELECT (public read) ──────────────────────────────────────
-- The bucket is public, but an explicit policy is good practice.
create policy "storage: public read"
  on storage.objects
  for select
  using (bucket_id = 'listing-images');

-- ── DELETE (owner only) ───────────────────────────────────────
-- Users may only delete files from their own folder.
create policy "storage: owner delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

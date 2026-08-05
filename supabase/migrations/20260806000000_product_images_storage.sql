-- ============================================================================
-- abdmall — 05. Product imagery → Supabase Storage
-- Rewrites local "/products/<file>.jpg" image paths to the public Storage
-- bucket URLs (bucket: product-images). Idempotent: only rows still pointing at
-- the old local path are changed, so it's a no-op on a fresh seed (which now
-- emits Storage URLs) and safe to re-run.
-- ============================================================================

update public.products
set image_url = replace(
  image_url,
  '/products/',
  'https://acmkyuwkfualxwlluwbs.supabase.co/storage/v1/object/public/product-images/'
)
where image_url like '/products/%';

update public.categories
set image_url = replace(
  image_url,
  '/products/',
  'https://acmkyuwkfualxwlluwbs.supabase.co/storage/v1/object/public/product-images/'
)
where image_url like '/products/%';

-- Migration: Add brand slug and product status fields
-- Run this SQL script in your Neon PostgreSQL database

-- 1. Add slug column to brands table
ALTER TABLE brands
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- 2. Add status column to products table (if not exists)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- 3. Create index on product status for better query performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 4. Generate slugs for existing brands (lowercase, replace spaces with hyphens)
UPDATE brands
SET slug = LOWER(REPLACE(TRIM(name), ' ', '-'))
WHERE slug IS NULL;

-- 5. Approve all existing products (so they show up on public pages)
UPDATE products
SET status = 'approved'
WHERE status = 'pending' OR status IS NULL;

-- Verification queries (optional - run to check)
-- SELECT id, name, slug FROM brands;
-- SELECT id, title, status FROM products LIMIT 10;

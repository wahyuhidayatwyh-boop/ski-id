-- ============================================================
-- COMPLETE TABLES MIGRATION FOR SKI WEBSITE
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. EVENTS TABLE (Acara & Kegiatan)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    content TEXT,
    thumbnail_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    quota INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming',
    is_registration_open BOOLEAN DEFAULT false,
    registration_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 2. GALLERIES TABLE (Dokumentasi / Galeri)
-- CATATAN: Tidak ada kolom event_id disini
-- ============================================================
CREATE TABLE IF NOT EXISTS galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    type VARCHAR(20) DEFAULT 'photo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 3. PRODUCTS TABLE (Katalog / Danusan)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INT DEFAULT 0,
    image_url TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 4. PENGURUS TABLE (Pengurus / Anggota Organisasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS pengurus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    jabatan TEXT,
    nim VARCHAR(50),
    prodi VARCHAR(100),
    photo_url TEXT,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 5. AKTIFKAN RLS
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengurus ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. DROP policies lama jika ada (hindari konflik)
-- ============================================================
DROP POLICY IF EXISTS "Public read events" ON events;
DROP POLICY IF EXISTS "Auth full access events" ON events;
DROP POLICY IF EXISTS "Public read galleries" ON galleries;
DROP POLICY IF EXISTS "Auth full access galleries" ON galleries;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Auth full access products" ON products;
DROP POLICY IF EXISTS "Public read pengurus" ON pengurus;
DROP POLICY IF EXISTS "Auth full access pengurus" ON pengurus;

-- ============================================================
-- 7. RLS POLICIES — Semua orang bisa baca (anon & authenticated)
-- ============================================================
CREATE POLICY "Public read events"    ON events    FOR SELECT USING (true);
CREATE POLICY "Public read galleries" ON galleries FOR SELECT USING (true);
CREATE POLICY "Public read products"  ON products  FOR SELECT USING (true);
CREATE POLICY "Public read pengurus"  ON pengurus  FOR SELECT USING (true);

-- ============================================================
-- 8. RLS POLICIES — Authenticated user bisa INSERT/UPDATE/DELETE
-- ============================================================
CREATE POLICY "Auth insert events"  ON events  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update events"  ON events  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete events"  ON events  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert galleries"  ON galleries  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update galleries"  ON galleries  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete galleries"  ON galleries  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert products"  ON products  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update products"  ON products  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete products"  ON products  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert pengurus"  ON pengurus  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update pengurus"  ON pengurus  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete pengurus"  ON pengurus  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 9. AUTO-UPDATE updated_at TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_galleries_updated_at ON galleries;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_pengurus_updated_at ON pengurus;

CREATE TRIGGER update_events_updated_at    BEFORE UPDATE ON events    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at  BEFORE UPDATE ON products  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pengurus_updated_at  BEFORE UPDATE ON pengurus  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CMS Database Schema for SKI Website Admin
-- Run this after the main schema.sql

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'admin1', 'admin2'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- HERO SECTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hero_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    backgroundImage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- ABOUT SECTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS about_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    imageUrl TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- VISION SECTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vision_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TEAM SECTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- FAQ SECTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faq_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    faqs JSONB DEFAULT '[]', -- Array of {question, answer}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- DIVISIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- INSERT DEFAULT ROLES
-- ============================================
INSERT INTO roles (name, description) VALUES 
    ('admin1', 'Full access - Beranda, Profil, Acara, Dokumentasi'),
    ('admin2', 'Katalog access - Produk dan Danusan')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables
CREATE POLICY "Public can view hero_section" ON hero_section FOR SELECT USING (true);
CREATE POLICY "Public can view about_section" ON about_section FOR SELECT USING (true);
CREATE POLICY "Public can view vision_section" ON vision_section FOR SELECT USING (true);
CREATE POLICY "Public can view team_section" ON team_section FOR SELECT USING (true);
CREATE POLICY "Public can view faq_section" ON faq_section FOR SELECT USING (true);
CREATE POLICY "Public can view divisions" ON divisions FOR SELECT USING (true);

-- Admin policies (authenticated users with admin role)
CREATE POLICY "Admins can manage hero_section" ON hero_section FOR ALL 
    USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage about_section" ON about_section FOR ALL 
    USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage vision_section" ON vision_section FOR ALL 
    USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage team_section" ON team_section FOR ALL 
    USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage faq_section" ON faq_section FOR ALL 
    USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage divisions" ON divisions FOR ALL 
    USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT r.name 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hero_section_updated_at BEFORE UPDATE ON hero_section
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_section_updated_at BEFORE UPDATE ON about_section
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vision_section_updated_at BEFORE UPDATE ON vision_section
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_section_updated_at BEFORE UPDATE ON team_section
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_section_updated_at BEFORE UPDATE ON faq_section
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default hero section
INSERT INTO hero_section (title, subtitle, backgroundImage) VALUES (
    'Sentral Kerohanian Islam',
    'Membangun Generasi Islami yang Berkarakter dan Berprestasi',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop'
) ON CONFLICT DO NOTHING;

-- Insert default about section
INSERT INTO about_section (title, content, imageUrl) VALUES (
    'Tentang SKI',
    'Sentral Kerohanian Islam (SKI) adalah organisasi kerohanian Islam di lingkungan Universitas Telkom Purwokerto yang berfokus pada pembinaan karakter islami mahasiswa.',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop'
) ON CONFLICT DO NOTHING;

-- Insert default vision section
INSERT INTO vision_section (title, content) VALUES (
    'Visi & Misi',
    'Menjadikan SKI sebagai wadah utama pembinaan karakter Islami mahasiswa yang istiqomah, adaptif, kolaboratif, serta berdaya guna tinggi.'
) ON CONFLICT DO NOTHING;

-- Insert default team section
INSERT INTO team_section (title, description) VALUES (
    'Pengurus SKI',
    'Dipimpin oleh para pengurus yang berkomitmen tinggi untuk memajukan organisasi dan memberikan manfaat bagi seluruh anggota.'
) ON CONFLICT DO NOTHING;

-- Insert default FAQ section
INSERT INTO faq_section (title, faqs) VALUES (
    'Pertanyaan Umum',
    '[
        {"question": "Apa itu SKI?", "answer": "SKI adalah Sentral Kerohanian Islam, organisasi yang fokus pada pembinaan keislaman mahasiswa."},
        {"question": "Bagaimana cara bergabung?", "answer": "Anda bisa mendaftar melalui open recruitment yang diadakan setiap awal tahun akademik."}
    ]'::jsonb
) ON CONFLICT DO NOTHING;
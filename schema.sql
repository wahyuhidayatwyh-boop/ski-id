-- PostgreSQL Schema untuk Sendra Kerohanian Islam (SKI)

-- 1. Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- Super Admin, Ketua, Media, Humas, Pengurus, Viewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users (Integrasi dengan Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Periods (Periode Kepengurusan)
CREATE TABLE periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    theme TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Divisions (Divisi Organisasi)
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- Syiar, Media, Humas, dll
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Positions (Jabatan)
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- Ketua, Wakil, Staff, dll
    level INT NOT NULL, -- Untuk hierarki
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Members (Pengurus)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    period_id UUID REFERENCES periods(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id),
    position_id UUID REFERENCES positions(id),
    major VARCHAR(100),
    batch VARCHAR(10),
    social_links JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Categories (Untuk Artikel/Event)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'article', 'event'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Articles (Berita & Artikel)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    thumbnail_url TEXT,
    author_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    status VARCHAR(50) DEFAULT 'draft', -- draft, published
    views_count INT DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Events (Program Kerja & Kegiatan)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    content TEXT,
    thumbnail_url TEXT,
    category_id UUID REFERENCES categories(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    quota INT,
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, finished
    is_registration_open BOOLEAN DEFAULT false,
    registration_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Event Registrations (Pendaftaran Event)
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    institution VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Galleries (Dokumentasi)
CREATE TABLE galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES events(id),
    image_url TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'photo', -- photo, video
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Products (Marketplace/Danusan)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image_url TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Achievements (Prestasi)
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    achiever_name TEXT NOT NULL, -- Nama anggota/organisasi
    level VARCHAR(100), -- Nasional, Internasional, dll
    achievement_date DATE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Recruitments (Open Recruitment)
CREATE TABLE recruitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id UUID REFERENCES periods(id),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, open, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Recruitment Applications
CREATE TABLE recruitment_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruitment_id UUID REFERENCES recruitments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    first_choice_division_id UUID REFERENCES divisions(id),
    second_choice_division_id UUID REFERENCES divisions(id),
    motivation TEXT,
    cv_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, interview, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

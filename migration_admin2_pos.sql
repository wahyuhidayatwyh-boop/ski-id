-- ============================================================
-- ADMIN 2 POS & CATALOG MIGRATION
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. UPDATE PRODUCTS TABLE
-- Menambahkan field baru untuk manajemen POS
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS production_count INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_count INT DEFAULT 0;

-- 2. CREATE SALES (TRANSAKSI) TABLE
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_name TEXT NOT NULL,
    buyer_phone VARCHAR(20),
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0, -- Modal * Quantity (untuk hitung profit)
    total_profit DECIMAL(10,2) NOT NULL DEFAULT 0, -- (Harga jual - Modal) * Quantity
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. CREATE EXPENSES (PENGELUARAN) TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    category VARCHAR(100),
    expense_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. ENABLE RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (Public read, Auth insert/update/delete)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read sales" ON sales;
    DROP POLICY IF EXISTS "Auth access sales" ON sales;
    DROP POLICY IF EXISTS "Public read expenses" ON expenses;
    DROP POLICY IF EXISTS "Auth access expenses" ON expenses;
EXCEPTION
    WHEN undefined_object THEN
        -- Do nothing
END $$;

CREATE POLICY "Public read sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Auth access sales" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Auth access expenses" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. TRIGGERS UNTUK AUTO-UPDATE updated_at
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
    DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
EXCEPTION
    WHEN undefined_object THEN
        -- Do nothing
END $$;

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FIX RLS & PERMISSIONS FOR DAKWAH-OS & POS TABLES
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- Aktifkan RLS untuk semua tabel baru
ALTER TABLE absensi_digital ENABLE ROW LEVEL SECURITY;
ALTER TABLE acara_internal ENABLE ROW LEVEL SECURITY;
ALTER TABLE prokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proker_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kabinets ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk mencegah konflik
DROP POLICY IF EXISTS "Enable full access for authenticated users on absensi_digital" ON absensi_digital;
DROP POLICY IF EXISTS "Enable full access for authenticated users on acara_internal" ON acara_internal;
DROP POLICY IF EXISTS "Enable full access for authenticated users on prokers" ON prokers;
DROP POLICY IF EXISTS "Enable full access for authenticated users on proker_tasks" ON proker_tasks;
DROP POLICY IF EXISTS "Enable full access for authenticated users on documents" ON documents;
DROP POLICY IF EXISTS "Enable full access for authenticated users on sales" ON sales;
DROP POLICY IF EXISTS "Enable full access for authenticated users on expenses" ON expenses;
DROP POLICY IF EXISTS "Enable full access for authenticated users on divisions" ON divisions;
DROP POLICY IF EXISTS "Enable full access for authenticated users on kabinets" ON kabinets;

-- Buat policy yang mengizinkan semua pengguna (Public Read) dan Auth (Insert/Update/Delete)
CREATE POLICY "Public read absensi_digital" ON absensi_digital FOR SELECT USING (true);
CREATE POLICY "Public read acara_internal" ON acara_internal FOR SELECT USING (true);
CREATE POLICY "Public read prokers" ON prokers FOR SELECT USING (true);
CREATE POLICY "Public read proker_tasks" ON proker_tasks FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public read sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Public read expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Public read divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Public read kabinets" ON kabinets FOR SELECT USING (true);

-- Authenticated Users Full Access
CREATE POLICY "Auth full access absensi_digital" ON absensi_digital FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access acara_internal" ON acara_internal FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access prokers" ON prokers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access proker_tasks" ON proker_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access sales" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access expenses" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access divisions" ON divisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access kabinets" ON kabinets FOR ALL TO authenticated USING (true) WITH CHECK (true);

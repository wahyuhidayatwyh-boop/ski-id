-- Buat storage bucket untuk menyimpan media publik (foto pengurus, cover divisi, proker)
insert into storage.buckets (id, name, public) 
values ('public_assets', 'public_assets', true)
on conflict (id) do nothing;

-- Set policy agar publik bisa melihat file (SELECT)
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'public_assets' );

-- Set policy agar authenticated user (atau admin) bisa mengupload file (INSERT)
create policy "Authenticated users can upload" 
on storage.objects for insert 
with check ( bucket_id = 'public_assets' and auth.role() = 'authenticated' );

create policy "Authenticated users can update" 
on storage.objects for update 
with check ( bucket_id = 'public_assets' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete" 
on storage.objects for delete 
using ( bucket_id = 'public_assets' and auth.role() = 'authenticated' );

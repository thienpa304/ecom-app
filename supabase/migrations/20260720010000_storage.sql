-- Public bucket for product images.
-- Note: the service role key bypasses RLS, so admin uploads via
-- SUPABASE_SERVICE_ROLE_KEY work even without an authenticated session.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "anon_read_product_images"
on storage.objects for select to anon
using (bucket_id = 'product-images');

create policy "authenticated_upload_product_images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

create policy "authenticated_update_product_images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images');

create policy "authenticated_delete_product_images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images');

create table if not exists public.media_labels (
  storage_path text primary key,
  label text not null,
  updated_at timestamptz not null default now()
);

comment on table public.media_labels is
  'Tên hiển thị do admin đặt cho file trong thư viện media. Tách khỏi Storage vì đổi tên object sẽ đổi public URL và làm vỡ mọi chỗ đang tham chiếu';
comment on column public.media_labels.storage_path is
  'Đường dẫn object trong bucket product-images, ví dụ img/anh-mat-truoc-1754870400000-a3f9k2.jpg';

create index if not exists idx_media_labels_label
  on public.media_labels (lower(label));

alter table public.media_labels enable row level security;

create policy "authenticated_all_media_labels"
  on public.media_labels for all
  to authenticated
  using (true)
  with check (true);

-- Unified product media (images + video + embed) — replaces product_images + products.video_url

create table if not exists public.product_media (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  kind text not null check (kind in ('image', 'video', 'embed')),
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  storage_path text,
  poster_url text
);

create index if not exists idx_product_media_product_id
  on public.product_media (product_id);

create index if not exists idx_product_media_sort
  on public.product_media (product_id, sort_order);

-- Migrate existing images
insert into public.product_media (id, product_id, kind, url, alt, sort_order, storage_path, poster_url)
select
  id,
  product_id,
  'image',
  url,
  alt,
  sort_order,
  null,
  null
from public.product_images
on conflict (id) do nothing;

-- Migrate video_url -> single media row per product
insert into public.product_media (id, product_id, kind, url, alt, sort_order, storage_path, poster_url)
select
  'pm-' || p.id || '-video',
  p.id,
  case
    when p.video_url ~* '(youtube\.com|youtu\.be|tiktok\.com)' then 'embed'
    when p.video_url ~* '\.(mp4|webm|mov|ogg|m4v)(\?|$)' then 'video'
    when p.video_url ~* '/storage/v1/object/public/' then 'video'
    else 'embed'
  end,
  p.video_url,
  'Video sản phẩm',
  coalesce(
    (select max(pi.sort_order) + 1 from public.product_images pi where pi.product_id = p.id),
    0
  ),
  null,
  null
from public.products p
where p.video_url is not null
  and trim(p.video_url) <> ''
  and not exists (
    select 1 from public.product_media pm
    where pm.product_id = p.id and pm.id = 'pm-' || p.id || '-video'
  );

-- RLS
alter table public.product_media enable row level security;

drop policy if exists "anon_select_published_product_media" on public.product_media;
create policy "anon_select_published_product_media"
  on public.product_media for select
  to anon
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_media.product_id
        and p.is_published = true
    )
  );

drop policy if exists "authenticated_all_product_media" on public.product_media;
create policy "authenticated_all_product_media"
  on public.product_media for all
  to authenticated
  using (true)
  with check (true);

-- Drop legacy structures
drop policy if exists "anon_select_published_product_images" on public.product_images;
drop policy if exists "authenticated_all_product_images" on public.product_images;
drop table if exists public.product_images cascade;

alter table public.products drop column if exists video_url;

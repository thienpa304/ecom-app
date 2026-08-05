create table if not exists public.home_sections (
  id text primary key,
  title text not null,
  kind text not null check (
    kind in ('top_sellers', 'featured', 'video', 'category', 'all_products')
  ),
  category_id text references public.categories (id) on delete set null,
  product_limit integer not null default 4 check (product_limit >= 0),
  style text not null default 'plain' check (style in ('plain', 'red_banner')),
  sort_order integer not null default 0,
  is_published boolean not null default true
);

comment on table public.home_sections is
  'Ordered list of homepage sections. The storefront renders published rows by sort_order.';
comment on column public.home_sections.title is
  'Heading shown above the section on the homepage';
comment on column public.home_sections.kind is
  'Data source: top_sellers | featured | video | category | all_products';
comment on column public.home_sections.category_id is
  'Only used when kind = category; the category whose products are listed';
comment on column public.home_sections.product_limit is
  'Maximum number of products rendered inside the section';
comment on column public.home_sections.style is
  'Visual treatment: plain heading or red_banner heading';
comment on column public.home_sections.sort_order is
  'Ascending render order on the homepage';
comment on column public.home_sections.is_published is
  'When false the section is hidden from the storefront';

create index if not exists idx_home_sections_sort_order
  on public.home_sections (sort_order);
create index if not exists idx_home_sections_category_id
  on public.home_sections (category_id);

alter table public.home_sections enable row level security;

drop policy if exists "anon_select_home_sections" on public.home_sections;
create policy "anon_select_home_sections"
  on public.home_sections for select
  to anon
  using (true);

drop policy if exists "authenticated_all_home_sections" on public.home_sections;
create policy "authenticated_all_home_sections"
  on public.home_sections for all
  to authenticated
  using (true)
  with check (true);

insert into public.home_sections (
  id,
  title,
  kind,
  category_id,
  product_limit,
  style,
  sort_order,
  is_published
)
select
  seed.id,
  seed.title,
  seed.kind,
  cat.id,
  seed.product_limit,
  seed.style,
  seed.sort_order,
  true
from (
  values
    (
      'home-top-sellers',
      'TOP MÁY XỊT RỬA CAO ÁP BÁN CHẠY',
      'top_sellers',
      null::text,
      4,
      'red_banner',
      1
    ),
    (
      'home-featured',
      'SẢN PHẨM NỔI BẬT',
      'featured',
      null,
      4,
      'plain',
      2
    ),
    (
      'home-video-review',
      'VIDEO REVIEW SẢN PHẨM',
      'video',
      null,
      4,
      'plain',
      3
    ),
    (
      'home-cat-may-xit-rua-cong-nghiep',
      'MÁY XỊT RỬA CÔNG NGHIỆP',
      'category',
      'may-xit-rua-cong-nghiep',
      4,
      'plain',
      4
    ),
    (
      'home-cat-may-rua-xe-gia-dinh',
      'MÁY RỬA XE GIA ĐÌNH',
      'category',
      'may-rua-xe-gia-dinh',
      4,
      'plain',
      5
    ),
    (
      'home-cat-may-phat-dien',
      'MÁY PHÁT ĐIỆN',
      'category',
      'may-phat-dien',
      4,
      'plain',
      6
    ),
    (
      'home-all-products',
      'TẤT CẢ SẢN PHẨM',
      'all_products',
      null,
      4,
      'plain',
      7
    )
) as seed (
  id,
  title,
  kind,
  category_slug,
  product_limit,
  style,
  sort_order
)
left join public.categories cat on cat.slug = seed.category_slug
where seed.kind <> 'category' or cat.id is not null
on conflict (id) do nothing;

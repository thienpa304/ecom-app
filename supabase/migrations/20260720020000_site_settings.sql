-- Site-wide storefront settings (single row, editable in admin)

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null,
  tagline text not null default '',
  phone text not null,
  zalo_url text not null default 'https://zalo.me/',
  address text not null default '',
  email text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  meta_description text not null default '',
  footer_blurb text not null default '',
  search_placeholder text not null default 'Tìm sản phẩm...',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "anon_select_site_settings"
  on public.site_settings for select
  to anon
  using (true);

create policy "authenticated_all_site_settings"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

insert into public.site_settings (
  id,
  site_name,
  tagline,
  phone,
  zalo_url,
  address,
  email,
  hero_title,
  hero_subtitle,
  meta_description,
  footer_blurb,
  search_placeholder
) values (
  1,
  'Điện Máy Của Thiên',
  'Cửa hàng điện máy — xem catalog, gọi tư vấn trực tiếp.',
  '02839756686',
  'https://zalo.me/',
  '',
  '',
  'Catalog điện máy & thiết bị gia dụng',
  'Xem thông số, giá khuyến mãi và liên hệ trực tiếp — không cần giỏ hàng, không thanh toán online.',
  'Điện Máy Của Thiên — catalog sản phẩm, gọi điện hoặc để lại SĐT tư vấn.',
  'Cửa hàng điện máy uy tín — hỗ trợ tư vấn chọn mua nhanh chóng.',
  'Tìm máy giặt, tủ lạnh, model...'
);

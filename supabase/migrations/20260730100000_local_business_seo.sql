alter table public.site_settings
  add column if not exists address_locality text not null default '',
  add column if not exists address_region text not null default '',
  add column if not exists postal_code text not null default '',
  add column if not exists latitude text not null default '',
  add column if not exists longitude text not null default '',
  add column if not exists price_range text not null default '',
  add column if not exists opening_hours jsonb not null default '[]'::jsonb,
  add column if not exists faqs jsonb not null default '[]'::jsonb,
  add column if not exists shipping_policy text not null default '',
  add column if not exists return_policy text not null default '';

comment on column public.site_settings.address_locality is
  'Ward/district part of the physical shop address, e.g. "Phường Bình Hưng Hòa, Quận Bình Tân"';
comment on column public.site_settings.address_region is
  'Province/city part of the physical shop address, e.g. "TP Hồ Chí Minh"';
comment on column public.site_settings.postal_code is
  'Postal code of the physical shop; empty when unknown';
comment on column public.site_settings.latitude is
  'Shop latitude copied from Google Maps, kept as text to preserve the exact typed value';
comment on column public.site_settings.longitude is
  'Shop longitude copied from Google Maps, kept as text to preserve the exact typed value';
comment on column public.site_settings.price_range is
  'Human readable price range of goods sold in store, e.g. "2.500.000₫ - 16.000.000₫"';
comment on column public.site_settings.opening_hours is
  'Store opening hours: [{"days":["Mo","Tu"],"opens":"08:00","closes":"18:00"}]';
comment on column public.site_settings.faqs is
  'Frequently asked questions: [{"question":"","answer":""}]';
comment on column public.site_settings.shipping_policy is
  'Plain multi-line shipping policy text shown to customers';
comment on column public.site_settings.return_policy is
  'Plain multi-line return and warranty policy text shown to customers';

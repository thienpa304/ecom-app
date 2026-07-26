alter table public.site_settings
  add column if not exists logo_square_url text not null default '';

comment on column public.site_settings.logo_square_url is
  'Square logo mark: mobile header, favicon and social/OG image';

comment on column public.site_settings.logo_url is
  'Horizontal logo lockup shown in the desktop header + footer (from media library)';

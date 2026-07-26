alter table public.site_settings
  add column if not exists logo_url text not null default '',
  add column if not exists header_cta_label text not null default 'Tư vấn và đặt hàng',
  add column if not exists hero_highlight text not null default '',
  add column if not exists hero_slides jsonb not null default '[]'::jsonb,
  add column if not exists hero_bullets jsonb not null default '[]'::jsonb,
  add column if not exists facebook_url text not null default '',
  add column if not exists youtube_url text not null default '',
  add column if not exists tiktok_url text not null default '',
  add column if not exists fanpage_embed_url text not null default '',
  add column if not exists map_embed_url text not null default '';

comment on column public.site_settings.logo_url is
  'Logo image URL shown in header + footer (from media library)';
comment on column public.site_settings.header_cta_label is
  'Label before the hotline number in the header CTA button';
comment on column public.site_settings.hero_highlight is
  'Substring of hero_title rendered in the brand blue colour';
comment on column public.site_settings.hero_slides is
  'Hero slideshow: [{"url":"","alt":"","href":""}] — auto-advances every 5s';
comment on column public.site_settings.hero_bullets is
  'Hero selling points: [{"icon":"globe","bold":"","text":""}]';
comment on column public.site_settings.fanpage_embed_url is
  'Facebook page plugin iframe src for the footer';
comment on column public.site_settings.map_embed_url is
  'Google Maps embed iframe src for the footer';

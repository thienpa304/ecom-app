-- Homepage hero poster image + overlay text (admin configurable)
alter table public.site_settings
  add column if not exists hero_image_url text not null default '',
  add column if not exists hero_card_title text not null default '',
  add column if not exists hero_card_caption text not null default '';

comment on column public.site_settings.hero_image_url is
  'Homepage hero poster image URL (from media library)';
comment on column public.site_settings.hero_card_title is
  'Text overlay title on hero poster card';
comment on column public.site_settings.hero_card_caption is
  'Text overlay caption on hero poster card';

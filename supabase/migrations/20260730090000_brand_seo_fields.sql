alter table public.brands
  add column if not exists description text not null default '',
  add column if not exists meta_title text not null default '',
  add column if not exists meta_description text not null default '';

comment on column public.brands.description is
  'Brand intro copy rendered at the top of /thuong-hieu/<slug> for SEO';
comment on column public.brands.meta_title is
  'SEO title override for the brand page; empty = derive from brand name';
comment on column public.brands.meta_description is
  'SEO meta description for the brand page; empty = derive from description';

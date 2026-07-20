-- Product SEO fields + rich HTML description (existing description column stores HTML)
alter table public.products
  add column if not exists meta_title text not null default '',
  add column if not exists meta_description text not null default '',
  add column if not exists seo_keywords text not null default '';

comment on column public.products.meta_title is
  'SEO title override; empty = use product name';
comment on column public.products.meta_description is
  'SEO meta description; empty = derive from description';
comment on column public.products.seo_keywords is
  'Comma-separated SEO keywords';
comment on column public.products.description is
  'Product body as HTML (rich text from admin editor)';

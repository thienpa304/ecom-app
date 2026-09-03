alter table public.categories
  add column if not exists description text not null default '';

comment on column public.categories.description is
  'Category intro copy shown under the H1 and used as the meta description of /danh-muc/<slug>; empty = derive a generic sentence from the name';

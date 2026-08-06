create table if not exists public.posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  cover_url text not null default '',
  cover_alt text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  author_name text not null default '',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.posts.excerpt is
  'Tóm tắt 1-2 câu, dùng cho card danh sách và fallback meta_description';
comment on column public.posts.body is
  'Nội dung bài viết dạng HTML (rich text từ admin editor), render qua sanitizeArticleHtml';
comment on column public.posts.cover_alt is
  'Alt ảnh cover — mô tả nội dung ảnh, không lặp y tiêu đề';
comment on column public.posts.meta_title is
  'SEO title override; rỗng = dùng title. KHÔNG gõ tên shop, layout tự thêm qua title.template';
comment on column public.posts.meta_description is
  'SEO meta description; rỗng = derive từ excerpt rồi tới text thuần của body';
comment on column public.posts.published_at is
  'Ngày đăng thật, dùng cho datePublished trong BlogPosting JSON-LD. Tách khỏi created_at vì created_at là lúc tạo nháp';

create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_posts_published_at
  on public.posts (published_at desc);

alter table public.posts enable row level security;

create policy "anon_select_published_posts"
  on public.posts for select
  to anon
  using (is_published = true);

create policy "authenticated_all_posts"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

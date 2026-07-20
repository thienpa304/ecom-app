-- Optional product video (YouTube / TikTok / direct mp4 URL).
alter table public.products
  add column if not exists video_url text;

comment on column public.products.video_url is
  'Optional product video: YouTube, TikTok, or direct media URL';

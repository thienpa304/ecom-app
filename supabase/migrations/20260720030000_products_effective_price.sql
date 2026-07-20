-- Effective catalog price for filter/sort (sale_price when discounted, else price)
alter table public.products
  add column if not exists effective_price numeric(14, 0)
  generated always as (
    case
      when sale_price is not null and sale_price < price then sale_price
      else price
    end
  ) stored;

create index if not exists idx_products_effective_price
  on public.products (effective_price);

create index if not exists idx_products_sold_count
  on public.products (sold_count desc);

create index if not exists idx_products_created_at
  on public.products (created_at desc);

create index if not exists idx_products_is_published
  on public.products (is_published)
  where is_published = true;

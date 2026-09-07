alter table public.products
  alter column specs drop default;

alter table public.products
  alter column specs type json using specs::json;

alter table public.products
  alter column specs set default '{}'::json;

comment on column public.products.specs is
  'Technical specs as a JSON object of "key": "value" pairs, in the order the admin typed them. Deliberately json and NOT jsonb: json keeps the key order, jsonb re-sorts keys by length then bytewise. Do not switch back to jsonb, add a GIN index, or use jsonb operators here without first changing the storage shape to an ordered array of {key, value}.';

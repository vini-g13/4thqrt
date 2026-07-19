-- 4THQRT: producten, voorraad, adminrollen en rate limiting.
-- Voer dit bestand uit via Supabase CLI of de SQL Editor van het project.

create extension if not exists pgcrypto;

create type public.inventory_reason as enum (
  'initial_stock',
  'delivery',
  'adjustment',
  'damaged',
  'sale',
  'return'
);

create type public.order_status as enum (
  'draft',
  'pending_payment',
  'paid',
  'cancelled',
  'refunded'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'manager', 'viewer')),
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_nl text not null,
  name_en text not null,
  description_nl text not null default '',
  description_en text not null default '',
  category text not null check (category in ('tshirt', 'hoodie', 'accessory')),
  image_urls jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  size text not null,
  color text not null,
  price_cents integer not null check (price_cents >= 0),
  available_quantity integer not null default 0 check (available_quantity >= 0),
  target_quantity integer not null default 0 check (target_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  delta integer not null check (delta <> 0),
  reason public.inventory_reason not null,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  status public.order_status not null default 'draft',
  currency text not null default 'eur',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  customer_email text,
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_label text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

-- Alleen een onomkeerbare hash van de bezoeker wordt bewaard, nooit het IP-adres zelf.
create table public.rate_limit_buckets (
  scope text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (scope, identifier_hash)
);

create index inventory_movements_variant_created_idx
  on public.inventory_movements (variant_id, created_at desc);
create index product_variants_product_idx on public.product_variants (product_id);
create index products_published_idx on public.products (is_published) where is_published;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'manager')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- De update en de voorraadlog gebeuren in één database-transactie.
create or replace function public.record_inventory_movement(
  p_variant_id uuid,
  p_delta integer,
  p_reason public.inventory_reason,
  p_note text default null
)
returns public.product_variants
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_variant public.product_variants;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if p_delta = 0 then
    raise exception 'Stock change cannot be zero';
  end if;

  update public.product_variants
  set available_quantity = available_quantity + p_delta
  where id = p_variant_id
    and available_quantity + p_delta >= 0
  returning * into updated_variant;

  if updated_variant.id is null then
    raise exception 'Variant not found or insufficient stock';
  end if;

  insert into public.inventory_movements (variant_id, delta, reason, note, actor_id)
  values (p_variant_id, p_delta, p_reason, nullif(trim(p_note), ''), auth.uid());

  return updated_variant;
end;
$$;

-- Atomische teller voor rate limiting. Deze functie wordt enkel door de server aangeroepen.
create or replace function public.consume_rate_limit(
  p_scope text,
  p_identifier_hash text,
  p_max_requests integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  bucket public.rate_limit_buckets;
  elapsed_seconds integer;
begin
  insert into public.rate_limit_buckets (scope, identifier_hash, window_started_at, request_count)
  values (p_scope, p_identifier_hash, now(), 1)
  on conflict (scope, identifier_hash) do update
  set window_started_at = case
        when extract(epoch from now() - public.rate_limit_buckets.window_started_at) >= p_window_seconds
          then now()
        else public.rate_limit_buckets.window_started_at
      end,
      request_count = case
        when extract(epoch from now() - public.rate_limit_buckets.window_started_at) >= p_window_seconds
          then 1
        else public.rate_limit_buckets.request_count + 1
      end
  returning * into bucket;

  elapsed_seconds := floor(extract(epoch from now() - bucket.window_started_at));
  return query select
    bucket.request_count <= p_max_requests,
    greatest(0, p_window_seconds - elapsed_seconds);
end;
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.rate_limit_buckets enable row level security;

create policy "Users can read their own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "Published products are public"
on public.products for select to anon, authenticated
using (is_published);

create policy "Published active variants are public"
on public.product_variants for select to anon, authenticated
using (
  is_active and exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and products.is_published
  )
);

create policy "Admins can manage products"
on public.products for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage variants"
on public.product_variants for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can view inventory movements"
on public.inventory_movements for select to authenticated
using (public.is_admin());

create policy "Admins can view orders"
on public.orders for select to authenticated
using (public.is_admin());

create policy "Admins can view order items"
on public.order_items for select to authenticated
using (public.is_admin());

revoke all on public.rate_limit_buckets from anon, authenticated;
revoke execute on function public.consume_rate_limit(text, text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

-- Veiligste standaard: nieuwe accounts zijn geen admin.
-- Maak na de eerste admin-login handmatig één account eigenaar:
-- update public.profiles set role = 'owner' where id = '<uuid-uit-auth.users>';

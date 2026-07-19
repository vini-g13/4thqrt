-- Tijdelijke catalogus voor de huidige demonstratie. Vervang foto's en teksten
-- later via de admin/database zodra de echte collectie beschikbaar is.

insert into public.products (
  slug, name_nl, name_en, description_nl, description_en, category, image_urls, is_published
) values
(
  '4thqrt-longsleeve-black',
  '4THQRT LONGSLEEVE — ZWART',
  '4THQRT LONGSLEEVE — BLACK',
  'De 4THQRT Longsleeve. Clean. Direct. Geen overbodige franjes. Beschikbaar in maten S tot en met XL. Verzonden in branded verpakking.',
  'The 4THQRT Longsleeve. Clean. Direct. No excess. Available in sizes S through XL. Shipped in branded packaging.',
  'tshirt',
  '["https://picsum.photos/seed/4thqrt-ls-black-1/600/750", "https://picsum.photos/seed/4thqrt-ls-black-2/600/750"]'::jsonb,
  true
),
(
  '4thqrt-longsleeve-pink',
  '4THQRT LONGSLEEVE — ROZE',
  '4THQRT LONGSLEEVE — PINK',
  'De 4THQRT Longsleeve. Zelfde snit, andere energie. Beschikbaar in maten S tot en met XL. Verzonden in branded verpakking.',
  'The 4THQRT Longsleeve. Same cut, different energy. Available in sizes S through XL. Shipped in branded packaging.',
  'tshirt',
  '["https://picsum.photos/seed/4thqrt-ls-pink-1/600/750", "https://picsum.photos/seed/4thqrt-ls-pink-2/600/750"]'::jsonb,
  true
)
on conflict (slug) do nothing;

insert into public.product_variants (
  product_id, sku, size, color, price_cents, available_quantity, target_quantity, is_active
)
select
  products.id,
  products.slug || '-' || sizes.size,
  sizes.size,
  case when products.slug like '%pink' then 'Pink' else 'Black' end,
  3999,
  10,
  10,
  true
from public.products
cross join (values ('S'), ('M'), ('L'), ('XL')) as sizes(size)
where products.slug in ('4thqrt-longsleeve-black', '4thqrt-longsleeve-pink')
on conflict (product_id, size, color) do nothing;

insert into public.inventory_movements (variant_id, delta, reason, note)
select variants.id, variants.available_quantity, 'initial_stock', 'Initiële demo-voorraad'
from public.product_variants variants
join public.products on products.id = variants.product_id
where products.slug in ('4thqrt-longsleeve-black', '4thqrt-longsleeve-pink')
  and not exists (
    select 1 from public.inventory_movements movements where movements.variant_id = variants.id
  );

-- Herstelt de tijdelijke demo-namen zonder speciale leestekens.
update public.products
set
  name_nl = '4THQRT LONGSLEEVE - ZWART',
  name_en = '4THQRT LONGSLEEVE - BLACK'
where slug = '4thqrt-longsleeve-black';

update public.products
set
  name_nl = '4THQRT LONGSLEEVE - ROZE',
  name_en = '4THQRT LONGSLEEVE - PINK'
where slug = '4thqrt-longsleeve-pink';

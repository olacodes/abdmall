-- ============================================================================
-- abdmall — 04. Product sort order
-- Adds a curated merchandising order to products so catalogue reads return a
-- stable, designed sequence (without it, Postgres returns rows in arbitrary
-- order that churns on every cache revalidation).
--
-- Additive + idempotent: applies cleanly via `db push` over an already-seeded
-- database (the backfill sets existing rows) and on a fresh `db reset` (the
-- backfill matches nothing on an empty table, then seed.sql supplies values).
-- ============================================================================

alter table public.products
  add column if not exists sort_order integer not null default 0;

create index if not exists products_sort_idx on public.products (sort_order);

-- Backfill existing rows by slug, matching the curated order in mock-data.ts.
update public.products p
set sort_order = v.n
from (values
  ('ankara-print-maxi-gown',1),
  ('agbada-senator-3-piece',2),
  ('adire-kaftan-shirt',3),
  ('kano-leather-palm-sandals',4),
  ('sego-gele-head-tie',5),
  ('ankara-two-piece-set',6),
  ('mens-senator-kaftan',7),
  ('aso-ebi-lace-fabric',8),
  ('mens-leather-loafers',9),
  ('tecno-spark-smartphone',10),
  ('i-pass-my-neighbour-generator',11),
  ('20000mah-power-bank',12),
  ('rechargeable-standing-fan',13),
  ('solar-rechargeable-lantern',14),
  ('infinix-hot-40-smartphone',15),
  ('3-5kva-key-start-generator',16),
  ('rechargeable-table-fan',17),
  ('10000mah-slim-power-bank',18),
  ('3-in-1-blender-grinder',19),
  ('nonstick-pot-set-5pcs',20),
  ('4-burner-gas-cooker',21),
  ('insulated-food-flask',22),
  ('blender-pro-1000w',23),
  ('stainless-pot-set-7pcs',24),
  ('table-top-gas-cooker-2burner',25),
  ('insulated-cooler-box-10l',26),
  ('dudu-osun-black-soap',27),
  ('raw-shea-butter-ori',28),
  ('cold-pressed-coconut-oil',29),
  ('matte-liquid-lipstick-set',30),
  ('black-soap-bar-3pack',31),
  ('whipped-shea-body-cream',32),
  ('coconut-hair-oil-250ml',33),
  ('lip-gloss-trio',34),
  ('golden-penny-rice-50kg',35),
  ('ijebu-garri-bucket',36),
  ('devon-kings-oil-25l',37),
  ('indomie-noodles-carton',38),
  ('peak-milk-powder-refill',39),
  ('fresh-plantain-bunch',40),
  ('mama-gold-rice-50kg',41),
  ('yellow-garri-bag',42),
  ('palm-oil-5l',43),
  ('gold-tone-statement-ring',44),
  ('twisted-gold-cuff-bracelet',45),
  ('18k-gold-plated-chain',46),
  ('teardrop-gemstone-pendant',47),
  ('rough-uncut-gemstone',48)
) as v(slug, n)
where p.slug = v.slug;

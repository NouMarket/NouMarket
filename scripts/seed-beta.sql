-- ============================================================
-- NouMarket – Beta Seed Data
-- ============================================================
-- PURPOSE : Populate a local/dev Supabase instance with realistic
--           test data for closed beta QA.
--
-- ⚠️  NEVER RUN IN PRODUCTION
--     This script inserts fake users and listings.
--     Use only against your LOCAL Supabase instance or a dedicated
--     staging project.
--
-- HOW TO RUN
-- ----------
-- Option A – Supabase local:
--   supabase start
--   supabase db reset           (applies migrations first)
--   psql $DATABASE_URL -f scripts/seed-beta.sql
--
-- Option B – Supabase dashboard:
--   Project → SQL Editor → paste this file → Run
--
-- STEP 1 — Create three test users via Supabase Auth first.
-- (Auth users cannot be inserted via plain SQL — GoTrue manages them.)
--
--   supabase auth create-user --email seller@beta.test  --password BetaTest1!
--   supabase auth create-user --email buyer@beta.test   --password BetaTest1!
--   supabase auth create-user --email admin@beta.test   --password BetaTest1!
--
--   Then copy the UUIDs printed by the CLI and set them below.
--   Or: Dashboard → Authentication → Users — create there and copy IDs.
--
-- STEP 2 — Set the three UUIDs below, then run this file.
-- ============================================================

-- ── CONFIGURE THESE ─────────────────────────────────────────
-- Replace with the actual UUIDs from your Supabase Auth users.
\set seller_id  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set buyer_id   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
\set admin_id   'cccccccc-cccc-cccc-cccc-cccccccccccc'
-- ─────────────────────────────────────────────────────────────

-- ── PROFILES ─────────────────────────────────────────────────
-- The trigger creates a minimal profile row on user signup.
-- These UPDATEs add realistic display data for testing.

update public.profiles set
  name          = 'Sophie Vendeur',
  bio           = 'Passionnée de décoration et de high-tech. Je vends ce dont je n''ai plus besoin.',
  location_id   = 'noumea-centre',
  location_name = 'Nouméa Centre',
  trust_level   = 'verified',
  response_rate = 92
where id = :'seller_id';

update public.profiles set
  name          = 'Marc Acheteur',
  bio           = 'Toujours à la recherche de bonnes affaires !',
  location_id   = 'dumbea',
  location_name = 'Dumbéa',
  trust_level   = 'new'
where id = :'buyer_id';

update public.profiles set
  name          = 'Admin NouMarket',
  trust_level   = 'trusted',
  is_admin      = true
where id = :'admin_id';

-- ── LISTINGS — ACTIVE (10) ───────────────────────────────────

insert into public.listings
  (id, slug, seller_id, title, description, price, price_negotiable,
   category_slug, location_id, location_name, status, condition)
values
  (
    'l0000001-0000-0000-0000-000000000001',
    'iphone-15-pro-excellent-etat-l0000001',
    :'seller_id',
    'iPhone 15 Pro – excellent état',
    'iPhone 15 Pro 256 Go, Titane naturel. Acheté en janvier 2024, jamais tombé. Batterie 98 %. Vendu avec boîte et câble USB-C d''origine.',
    135000, true, 'electronique', 'noumea-centre', 'Nouméa Centre',
    'active', 'like_new'
  ),
  (
    'l0000001-0000-0000-0000-000000000002',
    'macbook-air-m2-tres-bon-etat-l0000002',
    :'seller_id',
    'MacBook Air M2 – très bon état',
    'MacBook Air M2, 8 Go RAM, 256 Go SSD, coloris Minuit. Utilisé 18 mois, aucune rayure. Vendu avec chargeur MagSafe.',
    195000, false, 'electronique', 'noumea-centre', 'Nouméa Centre',
    'active', 'good'
  ),
  (
    'l0000001-0000-0000-0000-000000000003',
    'velo-electrique-peugeot-l0000003',
    :'seller_id',
    'Vélo électrique Peugeot eC01 D9',
    'Vélo électrique Peugeot eC01, assistance électrique jusqu''à 25 km/h, autonomie ~60 km, taille M. Entretenu régulièrement.',
    155000, true, 'vehicules', 'dumbea', 'Dumbéa',
    'active', 'good'
  ),
  (
    'l0000001-0000-0000-0000-000000000004',
    'canape-angle-convertible-l0000004',
    :'seller_id',
    'Canapé d''angle convertible gris',
    'Canapé d''angle 5 places avec méridienne droite, revêtement tissu gris anthracite. Très bon état, aucune tache. Dimensions : 280×160 cm.',
    85000, true, 'mobilier', 'noumea-centre', 'Nouméa Centre',
    'active', 'good'
  ),
  (
    'l0000001-0000-0000-0000-000000000005',
    'table-salle-manger-chenes-l0000005',
    :'seller_id',
    'Table salle à manger chêne massif + 6 chaises',
    'Table extensible 160→220 cm en chêne massif huilé, avec 6 chaises assorties. Achetée chez Maisons du Monde, peu utilisée.',
    120000, false, 'mobilier', 'mont-dore', 'Mont-Dore',
    'active', 'like_new'
  ),
  (
    'l0000001-0000-0000-0000-000000000006',
    'playstation-5-avec-2-manettes-l0000006',
    :'seller_id',
    'PlayStation 5 avec 2 manettes',
    'PS5 édition standard avec lecteur disque, 2 manettes DualSense (1 blanche + 1 rouge cosmique), 3 jeux inclus. Fonctionne parfaitement.',
    75000, true, 'electronique', 'noumea-centre', 'Nouméa Centre',
    'active', 'good'
  ),
  (
    'l0000001-0000-0000-0000-000000000007',
    'appareil-photo-sony-alpha-7-iv-l0000007',
    :'seller_id',
    'Sony Alpha 7 IV boîtier nu',
    'Boîtier Sony Alpha 7 IV (ILCE-7M4), ~8 000 déclenchements. Vendu sans objectif, avec 2 batteries, chargeur et sangle.',
    295000, false, 'electronique', 'noumea-centre', 'Nouméa Centre',
    'active', 'like_new'
  ),
  (
    'l0000001-0000-0000-0000-000000000008',
    'cours-francais-particuliers-l0000008',
    :'seller_id',
    'Cours de français particuliers – tous niveaux',
    'Professeure certifiée propose cours de français à domicile ou en visio. Primaire, collège, lycée, adultes. Tarif 3 500 XPF / heure.',
    3500, false, 'services', 'noumea-centre', 'Nouméa Centre',
    'active', null
  ),
  (
    'l0000001-0000-0000-0000-000000000009',
    'kayak-gonflable-intex-l0000009',
    :'seller_id',
    'Kayak gonflable Intex Explorer K2',
    'Kayak 2 places, couleur jaune. Utilisé 3 fois. Vendu avec 2 pagaies aluminium et pompe électrique. Parfait pour lagon.',
    28000, true, 'bateaux', 'noumea-anse-vata', 'Anse-Vata, Nouméa',
    'active', 'like_new'
  ),
  (
    'l0000001-0000-0000-0000-000000000010',
    'frigo-americain-samsung-l0000010',
    :'seller_id',
    'Réfrigérateur américain Samsung 600 L',
    'Frigo américain Samsung RS68, 600 L, inox. Distributeur eau/glaçons. Acheté 2021, fonctionne parfaitement. Déménagement oblige.',
    95000, true, 'mobilier', 'dumbea', 'Dumbéa',
    'active', 'good'
  )
on conflict (id) do nothing;

-- ── LISTINGS — PENDING (3) ───────────────────────────────────

insert into public.listings
  (id, slug, seller_id, title, description, price, price_negotiable,
   category_slug, location_id, location_name, status, condition)
values
  (
    'l0000002-0000-0000-0000-000000000001',
    'scooter-yamaha-n-max-125-l2000001',
    :'seller_id',
    'Scooter Yamaha N-Max 125 – 2021',
    'Scooter Yamaha N-Max 125, 2021, 12 000 km. Contrôle technique OK. Vendu avec 2 casques et top case.',
    350000, true, 'vehicules', 'noumea-centre', 'Nouméa Centre',
    'pending', 'good'
  ),
  (
    'l0000002-0000-0000-0000-000000000002',
    'appartement-f3-noumea-location-l2000002',
    :'seller_id',
    'F3 meublé Vallée-du-Tir – location',
    'Appartement F3 meublé, 65 m², Vallée-du-Tir. Cuisine équipée, 2 chambres, parking. Loyer 120 000 XPF / mois CC.',
    120000, false, 'immobilier', 'vallee-du-tir', 'Vallée-du-Tir, Nouméa',
    'pending', null
  ),
  (
    'l0000002-0000-0000-0000-000000000003',
    'guitare-electrique-fender-stratocaster-l2000003',
    :'seller_id',
    'Guitare électrique Fender Stratocaster',
    'Fender Stratocaster Player Series, sunburst. Vendue avec ampli Fender Mustang 40W et housse rigide. Excellent état.',
    95000, true, 'electronique', 'noumea-centre', 'Nouméa Centre',
    'pending', 'good'
  )
on conflict (id) do nothing;

-- ── LISTINGS — SOLD (2) ──────────────────────────────────────

insert into public.listings
  (id, slug, seller_id, title, description, price, price_negotiable,
   category_slug, location_id, location_name, status, condition)
values
  (
    'l0000003-0000-0000-0000-000000000001',
    'drone-dji-mini-3-pro-l3000001',
    :'seller_id',
    'Drone DJI Mini 3 Pro',
    'DJI Mini 3 Pro avec RC-N1, 3 batteries et sac de transport. 200 km de vol. VENDU.',
    95000, false, 'electronique', 'noumea-centre', 'Nouméa Centre',
    'sold', 'good'
  ),
  (
    'l0000003-0000-0000-0000-000000000002',
    'vtt-scott-aspect-940-l3000002',
    :'seller_id',
    'VTT Scott Aspect 940',
    'VTT Scott Aspect 940, taille L, 2022. Freins hydrauliques Shimano, fourche SR Suntour. VENDU.',
    65000, false, 'vehicules', 'dumbea', 'Dumbéa',
    'sold', 'good'
  )
on conflict (id) do nothing;

-- ── CONVERSATIONS & MESSAGES (2) ─────────────────────────────

insert into public.conversations
  (id, listing_id, buyer_id, seller_id)
values
  (
    'c0000001-0000-0000-0000-000000000001',
    'l0000001-0000-0000-0000-000000000001',
    :'buyer_id',
    :'seller_id'
  ),
  (
    'c0000001-0000-0000-0000-000000000002',
    'l0000001-0000-0000-0000-000000000004',
    :'buyer_id',
    :'seller_id'
  )
on conflict (listing_id, buyer_id) do nothing;

insert into public.messages
  (conversation_id, sender_id, body)
values
  (
    'c0000001-0000-0000-0000-000000000001',
    :'buyer_id',
    'Bonjour, l''iPhone est-il toujours disponible ? Est-ce qu''il est possible de le tester avant achat ?'
  ),
  (
    'c0000001-0000-0000-0000-000000000001',
    :'seller_id',
    'Bonjour ! Oui, toujours disponible. Bien sûr, vous pouvez le tester sur place. Je suis disponible ce week-end à Nouméa Centre.'
  ),
  (
    'c0000001-0000-0000-0000-000000000001',
    :'buyer_id',
    'Parfait ! Samedi matin vers 10h ça vous convient ?'
  ),
  (
    'c0000001-0000-0000-0000-000000000002',
    :'buyer_id',
    'Bonjour, le canapé est-il démontable pour faciliter le transport ?'
  ),
  (
    'c0000001-0000-0000-0000-000000000002',
    :'seller_id',
    'Oui, la méridienne se détache facilement. Il rentre dans un camion de 20 m³.'
  )
on conflict do nothing;

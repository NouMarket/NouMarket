-- ============================================================
-- NouMarket – Initial Schema Migration
-- Run in: Supabase Dashboard → SQL Editor
--         or via: supabase db push
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- Extends auth.users. Created automatically by trigger below.
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  name          text        not null,
  avatar_url    text,
  trust_level   text        not null default 'new'
                              check (trust_level in ('new', 'verified', 'trusted', 'pro')),
  location_id   text,
  location_name text,
  bio           text,
  is_admin      boolean     not null default false,
  response_rate int,
  member_since  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.profiles.is_admin is
  'Simple boolean admin flag. No moderator roles in v1.';

-- ────────────────────────────────────────────────────────────
-- LISTINGS
-- price is bigint (XPF — high-value real estate can reach
-- hundreds of millions; bigint avoids int overflow long-term)
-- ────────────────────────────────────────────────────────────
create table public.listings (
  id               uuid        primary key default gen_random_uuid(),
  slug             text        unique not null,
  seller_id        uuid        not null references public.profiles(id) on delete cascade,
  title            text        not null,
  description      text        not null,
  price            bigint      not null default 0,
  price_negotiable boolean     not null default false,
  category_slug    text        not null,
  location_id      text        not null,
  location_name    text        not null,
  status           text        not null default 'pending'
                                 check (status in (
                                   'draft', 'pending', 'active',
                                   'rejected', 'sold', 'expired', 'archived'
                                 )),
  condition        text        check (condition in (
                                 'new', 'like_new', 'good', 'fair', 'poor'
                               )),
  attributes       jsonb,
  is_featured      boolean     not null default false,
  views            int         not null default 0,
  rejection_reason text,
  reviewed_at      timestamptz,
  expires_at       timestamptz,
  fts              tsvector    generated always as (
                                 to_tsvector('french',
                                   coalesce(title, '') || ' ' || coalesce(description, ''))
                               ) stored,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column public.listings.slug is
  'Human-readable URL segment. Generated as slugify(title) + nanoid(6). Never changes after creation.';
comment on column public.listings.price is
  'Price in XPF (Pacific Franc). bigint for long-term safety with high-value listings.';
comment on column public.listings.fts is
  'Full-text search vector (French config). Generated, do not insert into directly.';

-- ────────────────────────────────────────────────────────────
-- LISTING IMAGES (ordered)
-- ────────────────────────────────────────────────────────────
create table public.listing_images (
  id         uuid        primary key default gen_random_uuid(),
  listing_id uuid        not null references public.listings(id) on delete cascade,
  url        text        not null,
  "order"    smallint    not null default 0,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- FAVORITES
-- ────────────────────────────────────────────────────────────
create table public.favorites (
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  listing_id uuid        not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ────────────────────────────────────────────────────────────
-- CONVERSATIONS
-- One per (listing, buyer) pair.
-- Soft-delete flags preserve message history per participant.
-- ────────────────────────────────────────────────────────────
create table public.conversations (
  id                uuid        primary key default gen_random_uuid(),
  listing_id        uuid        not null references public.listings(id) on delete cascade,
  buyer_id          uuid        not null references public.profiles(id) on delete cascade,
  seller_id         uuid        not null references public.profiles(id) on delete cascade,
  deleted_by_buyer  boolean     not null default false,
  deleted_by_seller boolean     not null default false,
  created_at        timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

comment on column public.conversations.deleted_by_buyer  is 'Soft delete. Row is preserved; buyer no longer sees this conversation.';
comment on column public.conversations.deleted_by_seller is 'Soft delete. Row is preserved; seller no longer sees this conversation.';

-- ────────────────────────────────────────────────────────────
-- MESSAGES
-- ────────────────────────────────────────────────────────────
create table public.messages (
  id              uuid        primary key default gen_random_uuid(),
  conversation_id uuid        not null references public.conversations(id) on delete cascade,
  sender_id       uuid        not null references public.profiles(id) on delete cascade,
  body            text        not null,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- LISTING REPORTS
-- One per (listing, reporter) pair — users can't double-report.
-- ────────────────────────────────────────────────────────────
create table public.listing_reports (
  id          uuid        primary key default gen_random_uuid(),
  listing_id  uuid        not null references public.listings(id) on delete cascade,
  reporter_id uuid        not null references public.profiles(id) on delete cascade,
  reason      text        not null
                            check (reason in (
                              'inappropriate', 'spam', 'fraud',
                              'wrong_category', 'other'
                            )),
  details     text,
  created_at  timestamptz not null default now(),
  unique (listing_id, reporter_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- listings — common filter + sort patterns
create index listings_seller_id_idx      on public.listings(seller_id);
create index listings_category_slug_idx  on public.listings(category_slug);
create index listings_status_idx         on public.listings(status);
create index listings_location_id_idx    on public.listings(location_id);
create index listings_created_at_idx     on public.listings(created_at desc);
create index listings_price_idx          on public.listings(price);
create index listings_fts_idx            on public.listings using gin(fts);

-- partial index for the most frequent query: active listings only
create index listings_active_created_idx on public.listings(created_at desc)
  where status = 'active';

-- listing_images — always loaded ordered by a listing
create index listing_images_listing_idx  on public.listing_images(listing_id, "order");

-- messages — inbox + unread badge queries
create index messages_conv_id_idx        on public.messages(conversation_id, created_at);
create index messages_unread_idx         on public.messages(read_at)
  where read_at is null;

-- conversations — inbox queries per user
create index conversations_buyer_idx     on public.conversations(buyer_id)
  where deleted_by_buyer  = false;
create index conversations_seller_idx    on public.conversations(seller_id)
  where deleted_by_seller = false;

-- favorites — user's saved listings
create index favorites_user_id_idx       on public.favorites(user_id);

-- reports — admin moderation queue
create index reports_listing_id_idx      on public.listing_reports(listing_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles        enable row level security;
alter table public.listings        enable row level security;
alter table public.listing_images  enable row level security;
alter table public.favorites       enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.listing_reports enable row level security;

-- ── profiles ─────────────────────────────────────────────────
-- Public seller info is readable by everyone
create policy "profiles: public read"
  on public.profiles
  for select
  using (true);

-- Only the profile owner can update their own row
create policy "profiles: owner update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── listings ─────────────────────────────────────────────────
-- Anyone can browse active listings
create policy "listings: public read active"
  on public.listings
  for select
  using (status = 'active');

-- Sellers can always see their own listings (all statuses)
create policy "listings: seller read own"
  on public.listings
  for select
  using (auth.uid() = seller_id);

-- Admins can read every listing regardless of status
create policy "listings: admin read all"
  on public.listings
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and is_admin = true
    )
  );

-- Authenticated users can create listings (their own)
create policy "listings: authenticated insert"
  on public.listings
  for insert
  with check (auth.uid() = seller_id);

-- Sellers can edit their own listings
create policy "listings: seller update own"
  on public.listings
  for update
  using  (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- Admins can update any listing (approve / reject / feature)
create policy "listings: admin update"
  on public.listings
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and is_admin = true
    )
  );

-- ── listing_images ───────────────────────────────────────────
create policy "listing_images: public read"
  on public.listing_images
  for select
  using (true);

create policy "listing_images: seller insert"
  on public.listing_images
  for insert
  with check (
    exists (
      select 1 from public.listings
      where id = listing_id
        and seller_id = auth.uid()
    )
  );

create policy "listing_images: seller delete"
  on public.listing_images
  for delete
  using (
    exists (
      select 1 from public.listings
      where id = listing_id
        and seller_id = auth.uid()
    )
  );

-- ── favorites ────────────────────────────────────────────────
create policy "favorites: owner read"
  on public.favorites
  for select
  using (auth.uid() = user_id);

create policy "favorites: owner insert"
  on public.favorites
  for insert
  with check (auth.uid() = user_id);

create policy "favorites: owner delete"
  on public.favorites
  for delete
  using (auth.uid() = user_id);

-- ── conversations ─────────────────────────────────────────────
-- Each participant only sees conversations they haven't soft-deleted
create policy "conversations: participant read"
  on public.conversations
  for select
  using (
    (auth.uid() = buyer_id  and deleted_by_buyer  = false)
    or
    (auth.uid() = seller_id and deleted_by_seller = false)
  );

-- Only the buyer initiates a conversation
create policy "conversations: buyer insert"
  on public.conversations
  for insert
  with check (auth.uid() = buyer_id);

-- Participants can set their own soft-delete flag
create policy "conversations: participant soft-delete"
  on public.conversations
  for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- ── messages ─────────────────────────────────────────────────
-- Only participants in the conversation can read messages
create policy "messages: participant read"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          (c.buyer_id  = auth.uid() and c.deleted_by_buyer  = false)
          or
          (c.seller_id = auth.uid() and c.deleted_by_seller = false)
        )
    )
  );

-- Participants can send messages; sender_id must match their own uid
create policy "messages: participant insert"
  on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Participants can mark messages as read (update read_at only)
create policy "messages: participant mark read"
  on public.messages
  for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  )
  with check (sender_id != auth.uid()); -- can only mark other's messages as read

-- ── listing_reports ──────────────────────────────────────────
-- Only admins can read reports
create policy "listing_reports: admin read"
  on public.listing_reports
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and is_admin = true
    )
  );

-- Authenticated users can submit one report per listing
create policy "listing_reports: authenticated insert"
  on public.listing_reports
  for insert
  with check (auth.uid() = reporter_id);

-- ============================================================
-- PROFILE AUTO-CREATION TRIGGER
-- Inserts a profiles row whenever a new auth.users row is created
-- (email signup, Google OAuth, etc.)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

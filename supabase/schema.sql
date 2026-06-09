-- Project Brew — cloud deck sync schema (v2.0.0)
-- Run this once in the Supabase SQL editor for your project.
-- See docs/specs/v2.0.0-google-auth-cloud-sync.md.

-- ─── decks ───────────────────────────────────────────────────────────────────
-- One row per deck. cards / sideboard / commander_ids are JSONB blobs that
-- mirror the in-app Deck shape. sideboard and commander_ids are NULLABLE so the
-- meaningful "no sideboard enabled" / "no commander" state (vs. an empty array)
-- round-trips correctly.

create table if not exists public.decks (
  id            uuid primary key,
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null default '',
  format        text not null default 'freeform',
  commander_ids jsonb,                                  -- string[] | null
  cards         jsonb not null default '[]'::jsonb,     -- DeckCard[]
  sideboard     jsonb,                                  -- DeckCard[] | null
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists decks_user_id_idx on public.decks (user_id);

-- ─── Row-Level Security ──────────────────────────────────────────────────────
-- Every query is implicitly scoped to the caller. This is what makes inviting
-- testers safe: no code path can return another user's decks.

alter table public.decks enable row level security;

drop policy if exists "own decks: select" on public.decks;
drop policy if exists "own decks: insert" on public.decks;
drop policy if exists "own decks: update" on public.decks;
drop policy if exists "own decks: delete" on public.decks;

create policy "own decks: select" on public.decks
  for select using (auth.uid() = user_id);
create policy "own decks: insert" on public.decks
  for insert with check (auth.uid() = user_id);
create policy "own decks: update" on public.decks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own decks: delete" on public.decks
  for delete using (auth.uid() = user_id);

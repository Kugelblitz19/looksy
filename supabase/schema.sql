-- ============================================================
-- Looksy database schema  (Supabase / PostgreSQL)
-- Run this once in the Supabase dashboard → SQL Editor → New query.
-- ============================================================

-- 1) PROFILES ------------------------------------------------
-- Supabase Auth already stores accounts (email, password) in the
-- built-in `auth.users` table. We keep extra public info here, one
-- row per user, linked to that account.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  created_at timestamptz not null default now()
);

-- Row Level Security: a user can only see/edit their OWN profile.
alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Automatically create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) SAVED LOOKS --------------------------------------------
-- The AI-generated looks a user chooses to keep (for the upcoming
-- "my saved looks" gallery). Each look belongs to one user.
create table if not exists public.saved_looks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  image_url  text not null,
  prompt     text,
  aesthetics text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.saved_looks enable row level security;

create policy "Users can manage their own saved looks"
  on public.saved_looks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists saved_looks_user_idx
  on public.saved_looks (user_id, created_at desc);

-- 3) SELFIE PERSISTENCE -------------------------------------
-- Path to the user's persisted selfie (in the private "selfies"
-- storage bucket) so it powers the avatar and auto-fills generation
-- without re-uploading every session.
alter table public.profiles
  add column if not exists selfie_path text;

-- 4) PUBLIC SHARE PAGES -------------------------------------
-- Lets a user make a saved look public at /look/<share_token>. The
-- image is copied into the public "public-looks" bucket and its URL
-- stored here; all other looks stay private.
alter table public.saved_looks
  add column if not exists share_token      text unique,
  add column if not exists is_public        boolean not null default false,
  add column if not exists public_image_url text;

-- ============================================================
-- STORAGE BUCKETS (already created via scripts/make-buckets.mjs):
--   selfies      — private
--   public-looks — public
-- ============================================================

-- =============================================
-- KTU Notify Studio — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLE: notifications
-- =============================================
create table if not exists public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  source_id       text unique not null,          -- hash / unique identifier
  title           text not null,
  description     text,
  published_date  date,
  pdf_url         text,
  original_url    text,
  content_hash    text,
  status          text not null default 'new'
                  check (status in ('new', 'processing', 'ready', 'published', 'failed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast status filtering
create index if not exists notifications_status_idx on public.notifications (status);
create index if not exists notifications_published_date_idx on public.notifications (published_date desc);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger notifications_updated_at
  before update on public.notifications
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.notifications enable row level security;

-- Everyone can read notifications (public board)
create policy "notifications_select_all"
  on public.notifications for select
  using (true);

-- Only service role / authenticated admins can insert/update/delete
create policy "notifications_insert_service"
  on public.notifications for insert
  with check (auth.role() = 'service_role');

create policy "notifications_update_service"
  on public.notifications for update
  using (auth.role() = 'service_role');

create policy "notifications_delete_service"
  on public.notifications for delete
  using (auth.role() = 'service_role');

-- =============================================
-- TABLE: brand_settings
-- =============================================
create table if not exists public.brand_settings (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users (id) on delete cascade not null unique,
  organization_name text not null default 'KTU Notify Studio',
  custom_footer     text not null default '@KTU_Updates',
  brand_color       text not null default '#E61E3D',
  default_font      text not null default 'Inter',
  logo_url          text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create or replace trigger brand_settings_updated_at
  before update on public.brand_settings
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.brand_settings enable row level security;

create policy "brand_settings_select_own"
  on public.brand_settings for select
  using (auth.uid() = user_id);

create policy "brand_settings_insert_own"
  on public.brand_settings for insert
  with check (auth.uid() = user_id);

create policy "brand_settings_update_own"
  on public.brand_settings for update
  using (auth.uid() = user_id);

create policy "brand_settings_delete_own"
  on public.brand_settings for delete
  using (auth.uid() = user_id);

-- =============================================
-- TABLE: generated_posters (pre-created for Phase 5)
-- =============================================
create table if not exists public.generated_posters (
  id                 uuid primary key default uuid_generate_v4(),
  notification_id    uuid references public.notifications (id) on delete set null,
  user_id            uuid references auth.users (id) on delete cascade not null,
  canvas_state_json  jsonb,
  thumbnail_url      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create or replace trigger generated_posters_updated_at
  before update on public.generated_posters
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.generated_posters enable row level security;

create policy "generated_posters_select_own"
  on public.generated_posters for select
  using (auth.uid() = user_id);

create policy "generated_posters_insert_own"
  on public.generated_posters for insert
  with check (auth.uid() = user_id);

create policy "generated_posters_update_own"
  on public.generated_posters for update
  using (auth.uid() = user_id);

create policy "generated_posters_delete_own"
  on public.generated_posters for delete
  using (auth.uid() = user_id);


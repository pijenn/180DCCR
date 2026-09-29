-- ==============================================================================
-- 180 Degrees Consulting UB - TV Companion Database Schema (Room-Based Architecture)
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Table: game_rooms
-- Stores game state per room code (e.g. '1345') as clean, flexible JSONB
create table if not exists public.game_rooms (
  room_code text primary key,
  state jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Row Level Security (RLS)
alter table public.game_rooms enable row level security;

-- 3. Public Policies for companion app (Anonymous client access)
drop policy if exists "Allow public select on game_rooms" on public.game_rooms;
create policy "Allow public select on game_rooms" on public.game_rooms for select using (true);

drop policy if exists "Allow public insert on game_rooms" on public.game_rooms;
create policy "Allow public insert on game_rooms" on public.game_rooms for insert with check (true);

drop policy if exists "Allow public update on game_rooms" on public.game_rooms;
create policy "Allow public update on game_rooms" on public.game_rooms for update using (true);

drop policy if exists "Allow public delete on game_rooms" on public.game_rooms;
create policy "Allow public delete on game_rooms" on public.game_rooms for delete using (true);

-- 4. Enable Supabase Realtime Publication for game_rooms
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'game_rooms'
  ) then
    alter publication supabase_realtime add table public.game_rooms;
  end if;
end $$;

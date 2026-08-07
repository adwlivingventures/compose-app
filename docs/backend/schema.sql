-- COMPOSE backend schema — run once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- Founder directive 2026-08-06: accounts + server-side persistence.
-- One row per user; the client's whole-snapshot sync (services/sync.ts)
-- upserts here. Row Level Security is the boundary: a user can only ever
-- touch his own row, even with the public anon key.

-- 1 · The state table -------------------------------------------------------

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- The full client snapshot (services/sync.ts Snapshot shape).
  state jsonb not null,
  -- Denormalized progress markers for ops/aggregate queries without
  -- opening the blob.
  active_day integer not null default 1,
  completed_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

drop policy if exists "own row select" on public.user_state;
create policy "own row select" on public.user_state
  for select using (auth.uid() = user_id);

drop policy if exists "own row insert" on public.user_state;
create policy "own row insert" on public.user_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "own row update" on public.user_state;
create policy "own row update" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own row delete" on public.user_state;
create policy "own row delete" on public.user_state
  for delete using (auth.uid() = user_id);

-- 2 · Account deletion (App Store Guideline 5.1.1(v)) -----------------------
-- Clients cannot delete auth users with the anon key; this SECURITY DEFINER
-- function does it for the calling user only. The user_state row goes with
-- the user via the cascade above.

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;

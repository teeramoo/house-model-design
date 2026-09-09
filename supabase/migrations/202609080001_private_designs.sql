begin;
create table public.interior_designs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  document jsonb not null check (
    jsonb_typeof(document) = 'object'
    and document->>'format' = 'supharat-interior'
    and document->>'version' = '1'
    and document ?& array['format','version','paint','moulding','land','modelVersion','furniture']
    and jsonb_typeof(document->'paint') = 'object'
    and jsonb_typeof(document->'moulding') = 'object'
    and jsonb_typeof(document->'land') = 'object'
    and jsonb_typeof(document->'furniture') = 'boolean'
    and octet_length(document::text) <= 524288
  ),
  created_at timestamptz not null default now()
);
create index interior_designs_owner_created_idx on public.interior_designs(owner_id, created_at desc, id desc);
alter table public.interior_designs enable row level security;
alter table public.interior_designs force row level security;
revoke all on public.interior_designs from public, anon, authenticated;
grant select on public.interior_designs to authenticated;
-- Immutable snapshots: clients cannot overwrite, delete, choose an owner or set timestamps.
grant insert (id, name, document) on public.interior_designs to authenticated;
create policy read_own_designs on public.interior_designs for select to authenticated
  using (owner_id = (select auth.uid()));
create policy save_own_designs on public.interior_designs for insert to authenticated
  with check (owner_id = (select auth.uid()));
commit;

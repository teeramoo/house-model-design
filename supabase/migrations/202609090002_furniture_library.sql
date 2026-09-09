begin;
create table public.furniture_managers(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.furniture_managers enable row level security;
revoke all on public.furniture_managers from public,anon,authenticated;
grant select on public.furniture_managers to authenticated;
create policy read_own_manager on public.furniture_managers for select to authenticated using(user_id=(select auth.uid()));
create table public.furniture_assets(
 id uuid primary key,
 name text not null check(char_length(btrim(name)) between 1 and 80),
 category text not null check(category in ('Seating','Tables','Beds','Storage','Lighting','Decor')),
 width double precision not null check(width>.001 and width<=30),
 height double precision not null check(height>.001 and height<=30),
 depth double precision not null check(depth>.001 and depth<=30),
 created_at timestamptz not null default now()
);
alter table public.furniture_assets enable row level security;
revoke all on public.furniture_assets from public,anon,authenticated;
grant select on public.furniture_assets to authenticated;
grant insert(id,name,category,width,height,depth) on public.furniture_assets to authenticated;
create policy read_furniture_catalog on public.furniture_assets for select to authenticated using(true);
create policy publish_furniture on public.furniture_assets for insert to authenticated with check(exists(select 1 from public.furniture_managers where user_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('furniture-assets','furniture-assets',false,10485760,array['model/gltf-binary']);
create policy read_furniture_models on storage.objects for select to authenticated using(bucket_id='furniture-assets');
create policy upload_furniture_models on storage.objects for insert to authenticated with check(bucket_id='furniture-assets' and name ~ '^[0-9a-f-]{36}\.glb$' and exists(select 1 from public.furniture_managers where user_id=(select auth.uid())));
-- Cleanup of an upload whose catalog insert failed. Published files remain immutable.
create policy cleanup_unpublished_furniture on storage.objects for delete to authenticated using(bucket_id='furniture-assets' and exists(select 1 from public.furniture_managers where user_id=(select auth.uid())) and not exists(select 1 from public.furniture_assets where id::text||'.glb'=storage.objects.name));
commit;

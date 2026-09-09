-- Disposable test DB only, after the auth fixture and both design migrations.
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated,anon;
grant select,insert,delete on storage.objects to authenticated,anon;
\ir ../supabase/migrations/202609090002_furniture_library.sql
insert into public.furniture_managers values('11111111-1111-4111-8111-111111111111');
set role authenticated;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
insert into storage.objects(bucket_id,name) values('furniture-assets','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.glb');
insert into public.furniture_assets(id,name,category,width,height,depth) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Chair','Seating',.5,.85,.55);
do $$begin
 delete from storage.objects where name='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.glb';
 if found then raise exception 'Published asset deletion allowed'; end if;
end$$;
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$begin
 if (select count(*) from public.furniture_assets)<>1 then raise exception 'Catalog unreadable'; end if;
 if (select count(*) from storage.objects)<>1 then raise exception 'Model unreadable'; end if;
 begin
 insert into storage.objects(bucket_id,name) values('furniture-assets','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.glb');
 raise exception 'Member upload allowed'; exception when insufficient_privilege then null; end;
 begin
 insert into public.furniture_managers values(auth.uid());
 raise exception 'Self promotion allowed'; exception when insufficient_privilege then null; end;
 begin
 insert into public.furniture_assets(id,name,category,width,height,depth) values(gen_random_uuid(),'Fake','Seating',1,1,1);
 raise exception 'Member publish allowed'; exception when insufficient_privilege then null; end;
end$$;
reset role;
set role anon;
do $$begin
 if exists(select 1 from storage.objects) then raise exception 'Guest model leak'; end if;
end$$;
reset role;
select 'PASS: manager upload, member catalog/model read, denied member publish/self-promotion, immutable published assets, guest denied' as result;

begin;
create table public.account_access(
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text,
 role text not null default 'member' check(role in ('owner','member')),
 enabled boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.account_access enable row level security;
revoke all on public.account_access from public,anon,authenticated;
grant select on public.account_access to authenticated;
create function public.is_house_owner() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.account_access where user_id=auth.uid() and role='owner' and enabled)$$;
create function public.house_access_enabled() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.account_access where user_id=auth.uid() and enabled)$$;
revoke all on function public.is_house_owner(),public.house_access_enabled() from public;
grant execute on function public.is_house_owner(),public.house_access_enabled() to authenticated;
create policy account_read on public.account_access for select to authenticated using(user_id=auth.uid() or public.is_house_owner());
insert into public.account_access(user_id,email) select id,email from auth.users;
create function public.register_house_account() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.account_access(user_id,email) values(new.id,new.email) on conflict(user_id) do update set email=excluded.email;return new;end$$;
create trigger register_house_account after insert or update of email on auth.users for each row execute function public.register_house_account();
create function public.manage_house_member(target uuid,access_enabled boolean,library_manager boolean) returns void language plpgsql security definer set search_path='' as $$begin
 if not public.is_house_owner() then raise exception 'Owner access required';end if;
 if not exists(select 1 from public.account_access where user_id=target and role='member') then raise exception 'Only member accounts may be changed';end if;
 update public.account_access set enabled=access_enabled where user_id=target;
 if library_manager and access_enabled then insert into public.furniture_managers(user_id) values(target) on conflict do nothing;else delete from public.furniture_managers where user_id=target;end if;
end$$;
revoke all on function public.manage_house_member(uuid,boolean,boolean) from public;
grant execute on function public.manage_house_member(uuid,boolean,boolean) to authenticated;
create policy owner_reads_managers on public.furniture_managers for select to authenticated using(public.is_house_owner());
create policy active_design_account on public.interior_designs as restrictive for all to authenticated using(public.house_access_enabled()) with check(public.house_access_enabled());
create policy active_catalog_account on public.furniture_assets as restrictive for all to authenticated using(public.house_access_enabled()) with check(public.house_access_enabled());
create policy active_furniture_storage on storage.objects as restrictive for all to authenticated using(bucket_id<>'furniture-assets' or public.house_access_enabled()) with check(bucket_id<>'furniture-assets' or public.house_access_enabled());
commit;
-- Bootstrap the owner separately in the SQL editor with their verified auth.users UUID:
-- update public.account_access set role='owner' where user_id='OWNER_UUID';

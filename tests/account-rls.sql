-- Disposable database only; run after furniture-rls.sql.
alter table auth.users add column email text;
\ir ../supabase/migrations/202609160001_account_management.sql
update public.account_access set role='owner' where user_id='11111111-1111-4111-8111-111111111111';
set role authenticated;
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$begin
 if (select count(*) from public.account_access)<>1 then raise exception 'Member sees other accounts';end if;
 begin perform public.manage_house_member(auth.uid(),true,true);raise exception 'Privilege escalation accepted';exception when raise_exception then if sqlerrm<>'Owner access required' then raise;end if;end;
 begin update public.account_access set role='owner';raise exception 'Direct promotion accepted';exception when insufficient_privilege then null;end;
end$$;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select public.manage_house_member('22222222-2222-4222-8222-222222222222',true,true);
do $$begin if not exists(select 1 from public.furniture_managers where user_id='22222222-2222-4222-8222-222222222222') then raise exception 'Manager grant failed';end if;end$$;
select public.manage_house_member('22222222-2222-4222-8222-222222222222',false,false);
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$begin
 if public.house_access_enabled() then raise exception 'Suspension failed';end if;
 if exists(select 1 from public.furniture_assets) or exists(select 1 from storage.objects) or exists(select 1 from public.interior_designs) then raise exception 'Suspended member retains access';end if;
end$$;
reset role;
select 'PASS: owner role grants, denied self promotion, member privacy, suspension across designs/catalog/storage';

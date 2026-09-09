begin;
alter table public.interior_designs add column history jsonb,
 add column revision integer not null default 1 check(revision>0);
alter table public.interior_designs add constraint bounded_history check(history is null or (jsonb_typeof(history)='object' and octet_length(history::text)<=4194304));
grant insert(history) on public.interior_designs to authenticated;
grant update(name,document,history,revision) on public.interior_designs to authenticated;
create policy update_own_designs on public.interior_designs for update to authenticated
 using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create function public.check_design_revision() returns trigger language plpgsql set search_path='' as $$
begin
 if new.revision <> old.revision+1 then raise exception 'Design revision must advance by one'; end if;
 return new;
end;
$$;
create trigger check_design_revision before update on public.interior_designs for each row execute function public.check_design_revision();
commit;

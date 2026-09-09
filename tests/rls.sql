set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
insert into public.interior_designs(id,name,document) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Alice interior','{"format":"supharat-interior","version":1,"modelVersion":"2026-09-08","paint":{},"moulding":{},"land":{},"furniture":false}');
do $$begin
 if (select count(*) from public.interior_designs) <> 1 then raise exception 'Own row missing'; end if;
 begin
 insert into public.interior_designs(owner_id,name,document) values ('22222222-2222-4222-8222-222222222222','Forged','{}');
 raise exception 'Forged owner accepted';
 exception when insufficient_privilege then null; end;
 update public.interior_designs set name='Updated',revision=2 where revision=1;
 if (select revision from public.interior_designs limit 1)<>2 then raise exception 'Own update failed'; end if;
 update public.interior_designs set name='Stale overwrite',revision=2 where revision=1;
 if found then raise exception 'Stale update accepted'; end if;
 begin
 insert into public.interior_designs(name,document) values ('Invalid','{"paint":{},"moulding":{},"land":{},"furniture":false,"modelVersion":"x"}');
 raise exception 'Invalid document accepted';
 exception when check_violation then null; end;
 begin
 insert into public.interior_designs(name,document) values (' ','{"format":"supharat-interior","version":1,"modelVersion":"2026-09-08","paint":{},"moulding":{},"land":{},"furniture":false}');
 raise exception 'Empty name accepted';
 exception when check_violation then null; end;
end$$;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
do $$begin
 update public.interior_designs set name='Hijacked',revision=3 where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 if found then raise exception 'Cross-account update accepted'; end if;
 if (select count(*) from public.interior_designs) <> 0 then raise exception 'Bob can read Alice'; end if;
 if exists(select 1 from public.interior_designs where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then raise exception 'Direct ID leaks Alice'; end if;
end$$;
insert into public.interior_designs(name,document) values ('Bob interior','{"format":"supharat-interior","version":1,"modelVersion":"2026-09-08","paint":{},"moulding":{},"land":{},"furniture":false}');
do $$begin
 if (select count(*) from public.interior_designs) <> 1 then raise exception 'Bob own design missing'; end if;
 if exists(select 1 from public.interior_designs where owner_id <> auth.uid()) then raise exception 'Owner isolation failed'; end if;
end$$;
reset role;
set role anon;
do $$begin
 begin perform * from public.interior_designs; raise exception 'Guest read accepted'; exception when insufficient_privilege then null; end;
 begin insert into public.interior_designs(name,document) values ('Guest','{}'); raise exception 'Guest write accepted'; exception when insufficient_privilege then null; end;
end$$;
reset role;
select 'PASS: two-user isolation, direct ID isolation, forged ownership denied, own updates and stale revision protection, invalid payload denied, guest access denied' as result;

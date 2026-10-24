create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
\i experiments/rls_homologacao.sql
grant usage on schema ck_test to authenticated;
grant select on ck_test.profiles,ck_test.assignments,ck_test.units to authenticated;
insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003');
insert into ck_test.profiles values ('00000000-0000-0000-0000-000000000001','consultor',true),('00000000-0000-0000-0000-000000000002','consultor',false),('00000000-0000-0000-0000-000000000003','diretoria',true);
insert into ck_test.units values (10,'Unidade A'),(20,'Unidade B');
insert into ck_test.assignments(user_id,unit_id,ended_at) values ('00000000-0000-0000-0000-000000000001',10,null),('00000000-0000-0000-0000-000000000001',20,now());

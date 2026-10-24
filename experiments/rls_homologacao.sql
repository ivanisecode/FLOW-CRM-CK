-- PROTOTIPO DE HOMOLOGACAO. NAO EXECUTAR NO BANCO DE PRODUCAO.
-- Rodar apenas em projeto Supabase isolado, sem dados reais.
-- Nao substitui politicas existentes nem faz DROP de objetos.
create schema if not exists ck_test;
create table ck_test.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('diretoria','supervisao_nacional','consultor')),
  active boolean not null default false
);
create table ck_test.assignments (
  user_id uuid not null references ck_test.profiles(user_id),
  unit_id integer not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  check (ended_at is null or ended_at >= started_at)
);
create unique index ck_test_one_active_assignment
on ck_test.assignments(user_id,unit_id) where ended_at is null;
create table ck_test.units (
  id integer primary key,
  name text not null
);
alter table ck_test.profiles enable row level security;
alter table ck_test.assignments enable row level security;
alter table ck_test.units enable row level security;

-- Exemplo para validar a ideia, NAO politica final de producao.
-- Sem SECURITY DEFINER: exige que o papel tenha SELECT nas tabelas consultadas.
create policy profile_self on ck_test.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy assignment_self on ck_test.assignments
  for select to authenticated using (user_id = (select auth.uid()));
create policy units_by_assignment on ck_test.units
  for select to authenticated using (
    exists (
      select 1 from ck_test.profiles p
      where p.user_id = (select auth.uid()) and p.active
        and (
          p.role in ('diretoria','supervisao_nacional')
          or exists (
            select 1 from ck_test.assignments a
            where a.user_id=p.user_id and a.unit_id=ck_test.units.id
              and a.ended_at is null
          )
        )
    )
  );
-- Nenhuma politica INSERT/UPDATE/DELETE para clientes autenticados.
-- IMPORTANTE: grants de schema/tabelas e provisioning administrativo
-- devem ser definidos explicitamente antes de testes via REST.

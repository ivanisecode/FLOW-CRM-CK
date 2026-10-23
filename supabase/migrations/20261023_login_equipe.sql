-- Login da equipe no Flow CRM
-- RODAR SÓ DEPOIS de: (1) o site novo (com tela de login) estar publicado no Netlify
-- e (2) a Ivanise ter entrado pelo menos uma vez com o próprio e-mail.
-- Antes disso, este script tranca o banco e o CRM antigo para de funcionar.

-- 1) Quem é da equipe: e-mail cadastrado na tela Usuários do CRM
update public.usuarios set email = 'supervisao@franquiasclubkids.com.br' where id = 'u_iva' and coalesce(email,'') = '';
insert into public.usuarios (id, nome, email, whatsapp)
  values ('u_jen', 'Jeniffer', '', '') on conflict (id) do nothing;

-- A checagem validada vive fora do schema exposto e exige e-mail confirmado.
create or replace function public.eh_equipe() returns boolean
language sql stable security invoker set search_path='' as $$select private.eh_equipe();$$;
revoke all on function public.eh_equipe() from public,anon;
grant execute on function public.eh_equipe() to authenticated;

-- 2) Tranca todas as tabelas: só quem entrou E é da equipe lê e grava.
--    A página da franqueada continua funcionando pelas funções plano_ler / plano_gravar (token).
do $$
declare t record; p record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t.tablename loop
      execute format('drop policy %I on public.%I', p.policyname, t.tablename);
    end loop;
    execute format('create policy equipe_total on public.%I for all to authenticated using (public.eh_equipe()) with check (public.eh_equipe())', t.tablename);
  end loop;
end $$;


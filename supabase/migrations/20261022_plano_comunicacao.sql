-- Plano de comunicação da franqueada (página de tarefas ligada ao Flow CRM)
-- Rodar uma vez no Supabase: SQL Editor > New query > colar tudo > Run.

-- 1) Um plano por unidade: o link da franqueada usa slug + token
create table if not exists public.plano_unidade (
  unit_id     text primary key,
  unit_name   text not null default '',
  slug        text not null,              -- pasta da página: /plano/<slug>/
  token       text not null unique,       -- vai no link: ?k=<token>
  franqueada  text not null default '',
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 2) Execução: cada tarefa, combinado, ação do dia, resumo do dia e indicador
create table if not exists public.plano_execucao (
  unit_id     text not null,
  item_id     text not null,              -- ex.: 12-manha, p3-publicado, plano-reuniao-trafego, _dia:12, _ind:1:pedidos
  dia         int,                        -- dia de novembro (0 = preparação, null = plano/reunião)
  nome        text not null default '',
  status      text not null default 'inicio',  -- inicio | andamento | feito | nao
  obs         text not null default '',
  escolha     text,                       -- ação escolhida em "minhas 3 ações"
  valor       text,                       -- indicador semanal ou resumo do dia ("5/8")
  updated_at  timestamptz not null default now(),
  primary key (unit_id, item_id)
);
create index if not exists plano_execucao_unit_idx on public.plano_execucao (unit_id, updated_at desc);

-- 3) Acesso: mesmo padrão das outras tabelas do CRM (chave anon).
--    A página da franqueada só grava pela função abaixo, que confere o token.
alter table public.plano_unidade  enable row level security;
alter table public.plano_execucao enable row level security;

drop policy if exists plano_unidade_anon_all on public.plano_unidade;
create policy plano_unidade_anon_all on public.plano_unidade for all to anon, authenticated using (true) with check (true);

drop policy if exists plano_execucao_anon_read on public.plano_execucao;
create policy plano_execucao_anon_read on public.plano_execucao for select to anon, authenticated using (true);

-- Leitura pela página: devolve a unidade e tudo o que já foi marcado
create or replace function public.plano_ler(p_token text)
returns json language plpgsql security definer set search_path = public as $$
declare u public.plano_unidade;
begin
  select * into u from public.plano_unidade where token = p_token and ativo;
  if not found then return null; end if;
  return json_build_object(
    'unit_id', u.unit_id, 'unit_name', u.unit_name, 'franqueada', u.franqueada,
    'itens', coalesce((select json_agg(json_build_object(
      'item_id', e.item_id, 'status', e.status, 'obs', e.obs, 'escolha', e.escolha,
      'valor', e.valor, 'updated_at', e.updated_at))
      from public.plano_execucao e where e.unit_id = u.unit_id), '[]'::json));
end $$;

-- Gravação pela página: só com token válido
create or replace function public.plano_gravar(p_token text, p_itens json)
returns int language plpgsql security definer set search_path = public as $$
declare u public.plano_unidade; it json; n int := 0;
begin
  select * into u from public.plano_unidade where token = p_token and ativo;
  if not found then raise exception 'token invalido'; end if;
  for it in select * from json_array_elements(p_itens) loop
    insert into public.plano_execucao (unit_id, item_id, dia, nome, status, obs, escolha, valor, updated_at)
    values (u.unit_id, it->>'item_id', nullif(it->>'dia','')::int, coalesce(it->>'nome',''),
            coalesce(it->>'status','inicio'), coalesce(it->>'obs',''), it->>'escolha', it->>'valor', now())
    on conflict (unit_id, item_id) do update set
      dia = excluded.dia, nome = excluded.nome, status = excluded.status, obs = excluded.obs,
      escolha = excluded.escolha, valor = excluded.valor, updated_at = now();
    n := n + 1;
  end loop;
  return n;
end $$;

grant execute on function public.plano_ler(text) to anon, authenticated;
grant execute on function public.plano_gravar(text, json) to anon, authenticated;

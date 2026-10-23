-- Plano por unidade. Os links são credenciais privadas e não podem ser listados por visitantes.
create schema if not exists private;
create table if not exists public.plano_unidade (
 unit_id text primary key,unit_name text not null default '',slug text not null,token text not null unique,
 franqueada text not null default '',ativo boolean not null default true,created_at timestamptz not null default now()
);
create table if not exists public.plano_execucao (
 unit_id text not null,item_id text not null,dia int,nome text not null default '',status text not null default 'inicio',
 obs text not null default '',escolha text,valor text,updated_at timestamptz not null default now(),primary key(unit_id,item_id)
);
create index if not exists plano_execucao_unit_idx on public.plano_execucao(unit_id,updated_at desc);

-- O helper fica fora do schema exposto. A identidade vem do JWT verificado, nunca de user_metadata.
create or replace function private.eh_equipe() returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from auth.users a where a.id=auth.uid() and a.email_confirmed_at is not null) and exists(
 select 1 from public.usuarios u where nullif(trim(u.email),'') is not null
 and lower(trim(u.email))=lower(coalesce(auth.jwt()->>'email','')));
$$;
revoke all on function private.eh_equipe() from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.eh_equipe() to authenticated;
create or replace function public.eh_equipe() returns boolean
language sql stable security invoker set search_path='' as $$select private.eh_equipe();$$;
revoke all on function public.eh_equipe() from public,anon;
grant execute on function public.eh_equipe() to authenticated;

alter table public.plano_unidade enable row level security;
alter table public.plano_execucao enable row level security;
drop policy if exists plano_unidade_anon_all on public.plano_unidade;
drop policy if exists plano_execucao_anon_read on public.plano_execucao;
drop policy if exists plano_unidade_equipe on public.plano_unidade;
drop policy if exists plano_execucao_equipe on public.plano_execucao;
create policy plano_unidade_equipe on public.plano_unidade for all to authenticated using(private.eh_equipe()) with check(private.eh_equipe());
create policy plano_execucao_equipe on public.plano_execucao for all to authenticated using(private.eh_equipe()) with check(private.eh_equipe());
revoke all on public.plano_unidade,public.plano_execucao from anon;
grant select,insert,update,delete on public.plano_unidade,public.plano_execucao to authenticated;

-- Acesso delegado por link: o token aleatório limita a leitura e gravação à sua unidade.
create or replace function private.plano_ler(p_token text) returns json
language plpgsql stable security definer set search_path='' as $$
declare u public.plano_unidade;
begin
 if p_token is null or length(p_token)<32 then return null; end if;
 select * into u from public.plano_unidade where token=p_token and ativo;
 if not found then return null; end if;
 return json_build_object('unit_id',u.unit_id,'unit_name',u.unit_name,'franqueada',u.franqueada,
 'itens',coalesce((select json_agg(json_build_object('item_id',e.item_id,'dia',e.dia,'nome',e.nome,'status',e.status,
 'obs',e.obs,'escolha',e.escolha,'valor',e.valor,'updated_at',e.updated_at)) from public.plano_execucao e where e.unit_id=u.unit_id),'[]'::json));
end $$;
create or replace function private.plano_gravar(p_token text,p_itens json) returns int
language plpgsql security definer set search_path='' as $$
declare u public.plano_unidade;it json;k text;v text;s text;d int;n int:=0;stamp timestamptz:=now();j jsonb;ref date;
begin
 if p_token is null or length(p_token)<32 then raise exception 'Link inválido';end if;
 select * into u from public.plano_unidade where token=p_token and ativo;
 if not found then raise exception 'Link inválido';end if;
 if json_typeof(p_itens)<>'array' or json_array_length(p_itens)>500 then raise exception 'Registros inválidos';end if;
 for it in select * from json_array_elements(p_itens) loop
  k:=it->>'item_id';s:=coalesce(it->>'status','inicio');v:=it->>'valor';d:=nullif(it->>'dia','')::int;
  if k is null or k!~'^[a-zA-Z0-9_:-]{1,160}$' or s not in('inicio','andamento','feito','nao')
   or length(coalesce(it->>'obs',''))>5000 or length(coalesce(it->>'nome',''))>1200 or length(coalesce(v,''))>30000
   or (d is not null and(d<0 or d>30)) then raise exception 'Registro inválido';end if;
  if left(k,9)='_comment:' then
   j:=v::jsonb;
   if coalesce(length(j->>'body'),0) not between 1 and 2000 or coalesce(j->>'taskId','')!~'^[a-zA-Z0-9_:-]{1,160}$' then raise exception 'Comentário inválido';end if;
   v:=jsonb_build_object('id',substring(k from 10),'taskId',j->>'taskId','body',j->>'body','author','Link da unidade','createdAt',stamp)::text;
  elsif left(k,8)='_weekly:' then
   ref:=substring(k from 9)::date;
   if extract(dow from ref)<>5 then raise exception 'Selecione uma sexta-feira';end if;
   s:='feito';v:=jsonb_build_object('kind','self_report','s','feito','sentAt',stamp,'confirmedBy','Link da unidade')::text;
  end if;
  insert into public.plano_execucao(unit_id,item_id,dia,nome,status,obs,escolha,valor,updated_at)
  values(u.unit_id,k,d,coalesce(it->>'nome',''),s,coalesce(it->>'obs',''),it->>'escolha',v,stamp)
  on conflict(unit_id,item_id) do update set dia=excluded.dia,nome=excluded.nome,status=excluded.status,obs=excluded.obs,
   escolha=excluded.escolha,valor=excluded.valor,updated_at=excluded.updated_at;
  n:=n+1;
 end loop;
 return n;
end $$;
revoke all on function private.plano_ler(text),private.plano_gravar(text,json) from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.plano_ler(text),private.plano_gravar(text,json) to anon,authenticated;
create or replace function public.plano_ler(p_token text) returns json
language sql stable security invoker set search_path='' as $$select private.plano_ler(p_token);$$;
create or replace function public.plano_gravar(p_token text,p_itens json) returns int
language sql security invoker set search_path='' as $$select private.plano_gravar(p_token,p_itens);$$;
revoke all on function public.plano_ler(text),public.plano_gravar(text,json) from public;
grant execute on function public.plano_ler(text),public.plano_gravar(text,json) to anon,authenticated;

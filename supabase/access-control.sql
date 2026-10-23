-- Acesso por unidade e aprovação exclusiva da supervisora.
create table if not exists private.unidade_acessos (
 email text not null, unit_id integer not null references public.units(id), nome text not null default '',
 origem text not null default 'aprovacao', ativo boolean not null default true,
 primary key(email,unit_id), check(email=lower(trim(email)))
);
alter table private.unidade_acessos enable row level security;
revoke all on private.unidade_acessos from public,anon,authenticated;
create or replace function private.eh_supervisora() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and lower(u.email)='supervisao@franquiasclubkids.com.br');
$$;
revoke all on function private.eh_supervisora() from public,anon;
grant execute on function private.eh_supervisora() to authenticated;
-- Só a supervisora altera quem tem acesso à equipe.
drop policy if exists equipe_total on public.usuarios;
create policy equipe_leitura on public.usuarios for select to authenticated using(private.eh_equipe());
create policy supervisora_insert on public.usuarios for insert to authenticated with check(private.eh_supervisora());
create policy supervisora_update on public.usuarios for update to authenticated using(private.eh_supervisora()) with check(private.eh_supervisora());
create policy supervisora_delete on public.usuarios for delete to authenticated using(private.eh_supervisora() and lower(coalesce(email,''))<>'supervisao@franquiasclubkids.com.br');

create table if not exists public.solicitacoes_acesso (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id),
 email text not null, nome text not null, unidade text not null default '', motivo text not null default '',
 status text not null default 'pendente' check(status in ('pendente','aprovado','negado')),
 created_at timestamptz not null default now(), decided_at timestamptz, decided_by uuid
);
alter table public.solicitacoes_acesso enable row level security;
revoke all on public.solicitacoes_acesso from public,anon,authenticated;
grant select on public.solicitacoes_acesso to authenticated;
create policy solicitacao_leitura on public.solicitacoes_acesso for select to authenticated using(user_id=auth.uid() or private.eh_supervisora());

create or replace function private.acesso_atual() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_email text; v_perfil text; v_unidades jsonb;
begin
 select lower(email) into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if v_email is null then return jsonb_build_object('perfil','pendente','unidades','[]'::jsonb); end if;
 if private.eh_supervisora() then v_perfil:='supervisora';
 elsif private.eh_equipe() then v_perfil:='analista';
 else v_perfil:='franqueada'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'nome',u.name,'plano',case when p.ativo then '/plano/'||p.slug||'/?k='||p.token else null end) order by u.name),'[]'::jsonb)
 into v_unidades from private.unidade_acessos a join public.units u on u.id=a.unit_id left join public.plano_unidade p on p.unit_id=u.id::text where a.email=v_email and a.ativo;
 if v_perfil='franqueada' and jsonb_array_length(v_unidades)=0 then v_perfil:='pendente'; end if;
 return jsonb_build_object('perfil',v_perfil,'unidades',v_unidades);
end $$;
create or replace function public.acesso_atual() returns jsonb language sql stable security invoker set search_path='' as $$select private.acesso_atual();$$;
revoke all on function private.acesso_atual(),public.acesso_atual() from public,anon;
grant execute on function private.acesso_atual(),public.acesso_atual() to authenticated;

create or replace function private.solicitar_acesso(p_nome text,p_unidade text,p_motivo text) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_email text; v_id uuid; v_novo boolean:=false; v_status text;
begin
 select lower(email) into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if v_email is null then raise exception 'Confirme seu e-mail antes de solicitar acesso'; end if;
 if length(trim(p_nome)) not between 2 and 120 or length(p_unidade)>160 or length(p_motivo)>1000 then raise exception 'Revise os campos do pedido'; end if;
 insert into public.solicitacoes_acesso(user_id,email,nome,unidade,motivo) values(auth.uid(),v_email,trim(p_nome),trim(p_unidade),trim(p_motivo)) on conflict(user_id) do nothing returning id into v_id;
 v_novo:=v_id is not null;
 select id,status into v_id,v_status from public.solicitacoes_acesso where user_id=auth.uid();
 return jsonb_build_object('id',v_id,'novo',v_novo,'email',v_email,'status',v_status);
end $$;
create or replace function public.solicitar_acesso(p_nome text,p_unidade text,p_motivo text) returns jsonb language sql security invoker set search_path='' as $$select private.solicitar_acesso(p_nome,p_unidade,p_motivo);$$;
revoke all on function private.solicitar_acesso(text,text,text),public.solicitar_acesso(text,text,text) from public,anon;
grant execute on function private.solicitar_acesso(text,text,text),public.solicitar_acesso(text,text,text) to authenticated;

create or replace function private.decidir_acesso(p_id uuid,p_aprovar boolean,p_perfil text,p_unit_id integer) returns void language plpgsql security definer set search_path='' as $$
declare r public.solicitacoes_acesso;
begin
 if not private.eh_supervisora() then raise exception 'Somente Ivanise pode autorizar acessos'; end if;
 select * into r from public.solicitacoes_acesso where id=p_id for update;
 if not found or r.status<>'pendente' then raise exception 'Pedido indisponível'; end if;
 if p_aprovar then
   if p_perfil='analista' then
     if not exists(select 1 from public.usuarios where lower(trim(email))=r.email) then insert into public.usuarios(id,nome,email) values(gen_random_uuid()::text,r.nome,r.email); end if;
   elsif p_perfil='franqueada' then
     if not exists(select 1 from public.units where id=p_unit_id) then raise exception 'Selecione a unidade'; end if;
     insert into private.unidade_acessos(email,unit_id,nome) values(r.email,p_unit_id,r.nome) on conflict(email,unit_id) do update set ativo=true;
   else raise exception 'Perfil inválido'; end if;
 end if;
 update public.solicitacoes_acesso set status=case when p_aprovar then 'aprovado' else 'negado' end,decided_at=now(),decided_by=auth.uid() where id=p_id;
end $$;
create or replace function public.decidir_acesso(p_id uuid,p_aprovar boolean,p_perfil text,p_unit_id integer) returns void language sql security invoker set search_path='' as $$select private.decidir_acesso(p_id,p_aprovar,p_perfil,p_unit_id);$$;
revoke all on function private.decidir_acesso(uuid,boolean,text,integer),public.decidir_acesso(uuid,boolean,text,integer) from public,anon;
grant execute on function private.decidir_acesso(uuid,boolean,text,integer),public.decidir_acesso(uuid,boolean,text,integer) to authenticated;

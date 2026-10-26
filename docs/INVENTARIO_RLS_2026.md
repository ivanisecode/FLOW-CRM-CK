# Inventário de políticas RLS — leitura de produção em 23/10/2026

## Confirmado por consultas SQL sem escrita
- 22 tabelas do schema `public` com RLS habilitado.
- 19 tabelas de negócio com política `equipe_total` (`TO authenticated`, `FOR ALL`, `USING eh_equipe()`, `WITH CHECK eh_equipe()`): `campanhas_adesao`, `contacts`, `demandas_arte`, `diario`, `faturamento_hist`, `inauguracao`, `inauguracoes`, `lancamento_diario`, `loja_jp`, `loja_jp_tasks`, `manutencao`, `manutencao_jp`, `metas_mensais`, `plano_execucao`, `plano_unidade`, `pre_meeting_forms`, `print3d`, `tasks`, `unit_diagnostico`, `units` (20 tabelas, conforme listagem).
- `usuarios` possui leitura para equipe e operações administrativas controladas por `private.eh_supervisora()`.
- `solicitacoes_acesso` possui leitura limitada a titular ou supervisora.
- `private.eh_equipe()` consulta usuário autenticado, e-mail confirmado e presença de e-mail na tabela `usuarios`.

## Risco e arquitetura
- O predicado `eh_equipe()` identifica a equipe, mas **não** restringe linhas por carteira. Uma política permissiva ampla mantém acesso amplo mesmo se outra política restritiva for adicionada; é necessário substituir a política ampla no momento da migração controlada.
- A UI não substitui a RLS.
- Evitar `auth.jwt()->>'email'` como fonte única de autorização a longo prazo: planejar vínculo imutável `auth.users.id` e cadastro administrativo protegido.
- `lancamento_diario` está atualmente com RLS habilitado (corrige informação de auditoria anterior).
- Há diferenças de tipo entre `unit_id` text e integer. Conferir valores reais antes de normalizar.

## Próxima entrega técnica
1. Implementar protótipo isolado de autorização no banco de homologação, com contas e unidades fictícias.
2. Criar perfis internos e atribuições, com revogação e trilha de auditoria.
3. Testar `SELECT`, `INSERT`, `UPDATE`, `DELETE` e mudança de `unit_id`.
4. Revisar cada tabela sem `unit_id` para definir escopo administrativo apropriado.
5. Somente depois migrar as políticas existentes, com backup e rollback.

**Nenhuma instrução deste documento deve ser executada diretamente em produção.**

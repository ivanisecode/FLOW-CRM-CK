# clubkids Gestão 360 — Plano de modernização (ambiente de desenvolvimento)

## Estado inicial confirmado (23/10/2026)
- Repositório React + Vite + TypeScript `ivanisecode/FLOW-CRM-CK`.
- Supabase existente `bqspprdmvludxeokcyjp` — preservar dados e tabelas atuais.
- O cliente `src/lib/supabase.ts` usa chamadas REST com token `anon`, sem sessão de usuário.
- O app mescla dados do banco com dados estáticos (`MEETINGS_DATA`, `RAW_UNITS`, `SEED_CADASTRO`).
- `src/lib/units.ts` calcula média trimestral usando `fat_mar`, `fat_abr`, `fat_mai`, sem janela móvel.
- `src/views/DashboardView.tsx` contém contagem de reuniões fixada em maio/junho de 2026.
- O app faz gravações em `units`, `contacts`, `tasks`, `usuarios`, `faturamento_hist`, `unit_diagnostico`.
- Auditoria anterior encontrou políticas RLS amplas; `lancamento_diario` sem RLS. Não mudar políticas em produção sem plano de transição.

## Regras de segurança e continuidade
1. Não alterar a branch `main`, banco de produção, deploy ou dados operacionais durante a preparação.
2. Criar ambiente isolado para testes; nunca apontar testes destrutivos ao banco atual.
3. Definir login Supabase Auth apenas para equipe da franqueadora.
4. Perfis: `diretoria`, `supervisao_nacional`, `consultor`; limitar consultor às unidades atribuídas.
5. Guardar permissões em tabelas protegidas ou `app_metadata`, nunca em `user_metadata`.
6. Não expor `service_role` no frontend; substituir o token legado por chave publicável + sessão autenticada.
7. Planejar migrações, rollback e testes RLS de usuário não autenticado, consultor e diretoria antes da implantação.
8. Proteger acesso à tabela `lancamento_diario` e demais módulos sem interromper integrações existentes.

## Entregas propostas
### Sprint 1 — fundação
- Mapear todas as chamadas REST, dependências e dados estáticos.
- Adicionar fluxo de autenticação e proteção de rotas em ambiente de teste.
- Modelar `profiles`, `unit_assignments` e histórico de atribuições.
- Testar permissões e migrações em banco isolado.
- Documentar implantação segura e rollback.

### Sprint 2 — dados confiáveis
- Cadastro mestre de unidades e vínculos com histórico de faturamento.
- Métricas por período móvel, sem usar campos de meses fixos.
- Separar dados demonstrativos de dados oficiais.
- Reuniões e tarefas persistidas, com auditoria.

### Sprint 3 — gestão
- Painel nacional, ficha 360°, alertas e carteira do consultor.
- Indicadores definidos com fontes, fórmulas e data de atualização.
- Testes de usabilidade e validação com supervisão nacional.

## Critérios de aceite para produção
- Nenhum acesso anônimo aos dados internos.
- Consultor não visualiza nem altera unidades de outra carteira.
- Dados históricos preservados e conciliados.
- Dashboard sem datas fixas e com indicadores rastreáveis.
- Plano de retorno à versão anterior testado.

> Este arquivo é documentação de planejamento, não migração nem alteração de segurança aplicada.

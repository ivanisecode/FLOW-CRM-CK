# Diagnóstico verificado do banco existente — 23/10/2026

Consulta **somente leitura** no projeto CRM de Franquias (`bqspprdmvludxeokcyjp`).

## Modelo real
- `units.id`: integer.
- `tasks.unit_id` e `contacts.unit_id`: integer.
- `faturamento_hist.unit_id` e `unit_diagnostico.unit_id`: text.
- `usuarios.id`: text.
- As tabelas `units`, `tasks`, `contacts`, `faturamento_hist` e `unit_diagnostico` têm política `equipe_total` para `authenticated` usando `eh_equipe()`.
- `public.eh_equipe()` delega a `private.eh_equipe()`.
- `private.eh_equipe()` exige `auth.uid()`, e-mail confirmado e e-mail correspondente na tabela `public.usuarios`. A função é `SECURITY DEFINER`.

## Implicações
1. A autenticação existente **não é inteiramente ausente** no banco: há uma regra de pertencimento à equipe.
2. A regra de equipe não é equivalente a autorização por carteira; quem passar por ela poderá receber acesso amplo onde `equipe_total` for a única política.
3. Antes de substituir políticas, auditar **todas** as políticas permissivas, privilégios SQL e dependências das funções.
4. Padronizar a chave de unidade em camada de migração, com mapeamento explícito e validação de integridade. Não converter IDs textuais sem inspeção de valores.
5. Não reutilizar `usuarios.id` como `auth.users.id` sem um mapeamento seguro.
6. Regras de consultor devem ser validadas no PostgreSQL/RLS; o utilitário React não é barreira de segurança.

## Situação da CI
A execução GitHub Actions `40045900210` para o commit `7a3f7c2` foi concluída com `success`.
Os testes executados são unitários/mocks, não testes reais de RLS.

## Próxima mudança segura
Projetar vínculo `auth.users.id` → perfil ativo → atribuições de unidade e testar num banco de homologação. Só depois propor migração de RLS de produção, com rollback e inventário de integrações.

# Homologação segura — clubkids Gestão 360

## Situação
A autenticação tem adaptador e testes com mocks, mas **não foi ativada** no App. Não há ambiente de homologação conectado ou RLS testado. O projeto Supabase de produção não deve ser usado para ensaios.

## Preparação
1. Provisionar projeto Supabase isolado (ou banco local via Supabase CLI) e anotar URL e chave publicável em variáveis de ambiente **não versionadas**.
2. Criar tabelas de perfil e vínculo de unidade com chave `auth.users.id`, papéis restritos e histórico de atribuição. Validar nomes e tipos reais antes de escrever migrações.
3. Criar três usuários fictícios (diretoria, supervisão, consultor) com atribuições a unidades sintéticas.
4. Implementar RLS para `units`, `tasks`, `contacts`, `faturamento_hist`, `unit_diagnostico` e demais tabelas expostas. Políticas devem verificar vínculo do usuário e permissão de operação.
5. Bloquear acesso `anon` a dados internos; testar acesso por REST diretamente (não apenas ocultar itens da interface).
6. Ligar `AuthLogin` ao adaptador Auth e implementar armazenamento de sessão, renovação, logout, expiração e tratamento de erro **apenas em homologação**.
7. Rodar build, testes unitários, integração, e matriz de autorização abaixo.

## Matriz mínima de testes
| Identidade | Unidade atribuída | Outra unidade |
|---|---|---|
| Sem login | Negado | Negado |
| Consultor ativo | Permitido conforme operação | Negado |
| Consultor inativo | Negado | Negado |
| Supervisão nacional | Permitido | Permitido |
| Diretoria | Permitido | Permitido |

Testar SELECT, INSERT, UPDATE, DELETE por tabela, incluindo tentativa de alterar `unit_id` em UPDATE, revogação de vínculo, sessão expirada e acesso por API REST. Testar que uma conta não consegue editar o próprio papel.

## Critérios de implantação
- CI verde, testes de autorização aprovados e logs revisados.
- Backup restaurável e procedimento de rollback documentado.
- Migrações revisadas, com avaliação de dependências do app atual.
- Não executar RLS ou mudanças de schema diretamente em produção nesta fase.

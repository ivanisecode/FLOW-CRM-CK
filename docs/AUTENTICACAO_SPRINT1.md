# Sprint 1 — Autenticação e permissões

## Implementado nesta branch
- Componente de interface `AuthLogin` com formulário de e-mail/senha, estado de carregamento e erro genérico.
- Tipos de papéis internos e função auxiliar `mayAccessUnit` para futura filtragem visual.
- **Nenhuma alteração em `main`, Supabase ou deploy.**
- O componente **não foi conectado ao aplicativo**: fazê-lo agora, com a API anônima atual, daria falsa sensação de segurança.

## Bloqueadores antes de ativar
1. Criar ambiente Supabase de teste independente, com dados sintéticos.
2. Configurar Supabase Auth, provisionamento somente por administradores e perfis protegidos.
3. Criar histórico de atribuição de consultores e políticas RLS para cada tabela.
4. Trocar cliente REST anônimo por cliente com sessão válida, refresh e logout.
5. Testar chamadas diretas à API com anon, consultor de outra carteira, consultor atribuído e diretoria.
6. Auditar módulos auxiliares e integrações antes de endurecer RLS em produção.
7. Planejar rollback, backup e janela de migração.

**Aviso:** `mayAccessUnit` é utilitário de UI e não substitui RLS. O banco atual continua com as permissões originais.

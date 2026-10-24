# Validação da fundação de autenticação

- CI executa `npm ci`, build e testes do adaptador Auth com Node 24.
- Testes usam mocks de `fetch`: **não fazem login real** nem acessam produção.
- A execução no GitHub Actions precisa ser confirmada na aba Actions.
- Não executar mudanças de RLS no banco de produção antes de testar com usuários de cada perfil.
- `AuthLogin` e `authApi` ainda não foram conectados ao `App.tsx`, por segurança.
- Próximo passo: ambiente Supabase de homologação, permissões de carteira e fluxo de sessão com refresh.

# Prototipo de RLS para homologacao

O arquivo `experiments/rls_homologacao.sql` modela perfis, carteiras e unidades **somente para testes em um projeto isolado**. Ele nao deve ser executado no projeto CRM de Franquias.

## Escopo
- Consultor ativo: apenas unidade atribuida.
- Diretoria e supervisao ativas: todas as unidades ficticias.
- Perfil inativo e sem login: nenhuma unidade.
- Escrita bloqueada ao cliente neste prototipo.
- Revogacao: preencher `ended_at`.

## Limites
Nao configura grants, nao cria usuarios Auth e nao testa o acesso REST. O schema `ck_test` pode nao estar exposto na Data API. Testes de integracao reais e desenho das permissoes de escrita ainda sao obrigatorios. Nao copiar politicas para tabelas de producao sem avaliar politicas permissivas atuais.

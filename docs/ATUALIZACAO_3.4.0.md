# Atualização 3.4.0

## Alterações
- Sidebar preserva a posição da rolagem durante a navegação.
- Meta diária configurável e usada no Dashboard e Painel Executivo.
- Descrição de sangria e suprimento opcional.
- Página Configurações com nome, logo, cores, claro/escuro/automático, prévia e restauração do padrão.
- Configurações sincronizadas pelo Supabase.

## Passo obrigatório no Supabase
Execute o arquivo `database/configuracoes_tema_v3_4_0.sql` no SQL Editor.

## Depois
Na pasta `frontend`:

```bash
npm install
npm run dev
```

O ZIP não inclui `.env`, `.env.local`, `node_modules` nem `.git` por segurança e para reduzir o tamanho.

# Backup e restauração

1. No Supabase, abra Database > Backups e confirme a disponibilidade no seu plano.
2. Para uma cópia manual, exporte as tabelas principais: vendas, itens_venda, produtos, mesas, perfis, caixas e caixa_movimentacoes.
3. Guarde o arquivo em local privado. Ele pode conter dados de clientes e funcionários.
4. Antes de restaurar, faça uma nova cópia do estado atual.
5. Teste restaurações primeiro em um projeto Supabase separado.

Nunca publique arquivos `.env`, senhas ou chaves privadas no GitHub.

-- SEU ANTÔNIO SPETTUS — correção da exclusão do histórico
-- Cole TODO este conteúdo no SQL Editor do Supabase e clique em Run.

create or replace function public.apagar_historico_vendas()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
    total_apagado bigint := 0;
begin
    -- Confirma que o usuário conectado é um administrador ativo.
    if auth.uid() is null then
        raise exception 'Usuário não autenticado.';
    end if;

    if not exists (
        select 1
        from public.perfis
        where id = auth.uid()
          and coalesce(ativo, true) = true
          and lower(trim(coalesce(cargo::text, ''))) in (
              'administrador',
              'admin'
          )
    ) then
        raise exception 'Somente administradores ativos podem apagar o histórico.';
    end if;

    select count(*)
      into total_apagado
      from public.vendas;

    -- Apaga primeiro os itens para não depender da configuração da chave estrangeira.
    delete from public.itens_venda
    where id is not null;

    delete from public.vendas
    where id is not null;

    return total_apagado;
end;
$$;

revoke all on function public.apagar_historico_vendas() from public;
revoke all on function public.apagar_historico_vendas() from anon;
grant execute on function public.apagar_historico_vendas() to authenticated;

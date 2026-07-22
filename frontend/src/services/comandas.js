import { supabase } from './supabase';

function formatarItem(item) {
    return {
        id: Number(item.id),
        nome: item.nome || '',
        preco: Number(item.preco || 0),
        quantidade: Number(item.quantidade || 0),
        observacao: item.observacao || ''
    };
}

function formatarComanda(comanda) {
    return {
        mesa: Number(comanda.mesa),
        cliente: comanda.cliente || '',
        itens: Array.isArray(comanda.itens)
            ? comanda.itens.map(formatarItem)
            : [],
        desconto: Number(comanda.desconto || 0),
        acrescimo: Number(comanda.acrescimo || 0),
        aberto_por: comanda.aberto_por || null,
        atualizado_por: comanda.atualizado_por || null,
        aberto_em: comanda.aberto_em || null,
        atualizado_em: comanda.atualizado_em || null
    };
}

export async function listarComandas() {
    const { data, error } = await supabase
        .from('comandas_abertas')
        .select(`
            mesa,
            cliente,
            itens,
            desconto,
            acrescimo,
            aberto_por,
            atualizado_por,
            aberto_em,
            atualizado_em
        `)
        .order('mesa', {
            ascending: true
        });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(
        formatarComanda
    );
}

export async function buscarComanda(
    numeroMesa
) {
    const { data, error } = await supabase
        .from('comandas_abertas')
        .select(`
            mesa,
            cliente,
            itens,
            desconto,
            acrescimo,
            aberto_por,
            atualizado_por,
            aberto_em,
            atualizado_em
        `)
        .eq('mesa', Number(numeroMesa))
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data
        ? formatarComanda(data)
        : null;
}

export async function salvarComanda(
    numeroMesa,
    alteracoes
) {
    const {
        data: dadosUsuario,
        error: erroUsuario
    } = await supabase.auth.getUser();

    if (erroUsuario || !dadosUsuario.user) {
        throw new Error('Usuário não autenticado.');
    }

    const agora = new Date().toISOString();

    const payload = {
        mesa: Number(numeroMesa),
        cliente: alteracoes.cliente || '',
        itens: Array.isArray(alteracoes.itens)
            ? alteracoes.itens
            : [],
        desconto: Number(alteracoes.desconto || 0),
        acrescimo: Number(alteracoes.acrescimo || 0),
        aberto_por:
            alteracoes.aberto_por ||
            dadosUsuario.user.id,
        aberto_em:
            alteracoes.aberto_em ||
            agora,
        atualizado_por: dadosUsuario.user.id,
        atualizado_em: agora
    };

    const { data, error } = await supabase
        .from('comandas_abertas')
        .upsert(payload, {
            onConflict: 'mesa'
        })
        .select(`
            mesa,
            cliente,
            itens,
            desconto,
            acrescimo,
            aberto_por,
            atualizado_por,
            aberto_em,
            atualizado_em
        `)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return formatarComanda(data);
}

export async function excluirComanda(
    numeroMesa
) {
    const { error } = await supabase
        .from('comandas_abertas')
        .delete()
        .eq('mesa', Number(numeroMesa));

    if (error) {
        throw new Error(error.message);
    }
}

export function assinarComandas(
    aoAtualizar
) {
    const canal = supabase
        .channel('comandas-abertas-tempo-real')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'comandas_abertas'
            },
            payload => {
                const evento = {
                    eventType: payload.eventType,
                    nova: payload.new?.mesa
                        ? formatarComanda(payload.new)
                        : null,
                    anterior: payload.old?.mesa
                        ? { mesa: Number(payload.old.mesa) }
                        : null
                };

                aoAtualizar(evento);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(canal);
    };
}
import { supabase } from './supabase';

export async function listarMesas() {
    const { data, error } = await supabase
        .from('mesas')
        .select(`
            id,
            numero,
            nome,
            ativa,
            ordem,
            criado_em,
            atualizado_em
        `)
        .eq('ativa', true)
        .order('ordem', {
            ascending: true
        });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}

export async function criarMesa({
    numero,
    nome
}) {
    const { data, error } = await supabase
        .from('mesas')
        .insert({
            numero,
            nome,
            ativa: true,
            ordem: numero
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function atualizarMesa(
    id,
    alteracoes
) {
    const { data, error } = await supabase
        .from('mesas')
        .update({
            ...alteracoes,
            atualizado_em:
                new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function excluirMesa(id) {
    const { error } = await supabase
        .from('mesas')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}
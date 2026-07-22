import { supabase } from './supabase';

const CAMPOS_PRODUTO = `
    id,
    nome,
    preco,
    categoria,
    descricao,
    imagem,
    ativo,
    destaque,
    ordem,
    criado_em,
    atualizado_em
`;

function formatarProduto(produto) {
    return {
        ...produto,
        preco: Number(produto.preco || 0),
        ordem: Number(produto.ordem || 0),
        ativo: produto.ativo !== false,
        destaque: Boolean(produto.destaque)
    };
}

export async function listarProdutos({
    incluirInativos = true
} = {}) {
    let consulta = supabase
        .from('produtos')
        .select(CAMPOS_PRODUTO)
        .order('ordem', {
            ascending: true
        })
        .order('nome', {
            ascending: true
        });

    if (!incluirInativos) {
        consulta = consulta.eq('ativo', true);
    }

    const { data, error } = await consulta;

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(formatarProduto);
}

export async function criarProduto(produto) {
    const { data, error } = await supabase
        .from('produtos')
        .insert({
            nome: produto.nome.trim(),
            preco: Number(produto.preco),
            categoria: produto.categoria.trim(),
            descricao: produto.descricao?.trim() || '',
            imagem: produto.imagem?.trim() || '',
            ativo: produto.ativo !== false,
            destaque: Boolean(produto.destaque),
            ordem: Number(produto.ordem)
        })
        .select(CAMPOS_PRODUTO)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return formatarProduto(data);
}

export async function atualizarProduto(
    id,
    alteracoes
) {
    const dadosAtualizados = {
        ...alteracoes,
        atualizado_em: new Date().toISOString()
    };

    if ('preco' in dadosAtualizados) {
        dadosAtualizados.preco = Number(
            dadosAtualizados.preco
        );
    }

    if ('ordem' in dadosAtualizados) {
        dadosAtualizados.ordem = Number(
            dadosAtualizados.ordem
        );
    }

    if ('nome' in dadosAtualizados) {
        dadosAtualizados.nome =
            dadosAtualizados.nome.trim();
    }

    if ('categoria' in dadosAtualizados) {
        dadosAtualizados.categoria =
            dadosAtualizados.categoria.trim();
    }

    if ('descricao' in dadosAtualizados) {
        dadosAtualizados.descricao =
            dadosAtualizados.descricao.trim();
    }

    if ('imagem' in dadosAtualizados) {
        dadosAtualizados.imagem =
            dadosAtualizados.imagem.trim();
    }

    const { data, error } = await supabase
        .from('produtos')
        .update(dadosAtualizados)
        .eq('id', id)
        .select(CAMPOS_PRODUTO)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return formatarProduto(data);
}

export async function excluirProduto(id) {
    const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}
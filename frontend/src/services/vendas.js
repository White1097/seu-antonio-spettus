import { supabase } from './supabase';
import { criarMovimentacao } from './caixa';

function formatarVenda(venda) {
    return {
        ...venda,
        mesa: Number(venda.mesa),
        subtotal: Number(venda.subtotal),
        desconto: Number(venda.desconto),
        acrescimo: Number(venda.acrescimo),
        total: Number(venda.total),
        itens: (venda.itens_venda || []).map(item => ({
            id: Number(item.produto_id),
            nome: item.nome_produto,
            preco: Number(item.preco_unitario),
            quantidade: Number(item.quantidade),
            observacao: item.observacao || ''
        }))
    };
}

export async function listarVendas() {
    const { data, error } = await supabase
        .from('vendas')
        .select(`
            *,
            itens_venda (
                produto_id,
                nome_produto,
                preco_unitario,
                quantidade,
                observacao
            )
        `)
        .order('criado_em', {
            ascending: false
        });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(formatarVenda);
}

export async function registrarVenda({
    mesa,
    cliente,
    itens,
    subtotal,
    desconto,
    acrescimo,
    total,
    pagamento
}) {
    const {
        data: usuario,
        error: erroUsuario
    } = await supabase.auth.getUser();

    if (erroUsuario || !usuario.user) {
        throw new Error('Usuário não autenticado.');
    }

    const { data: venda, error } = await supabase
        .from('vendas')
        .insert({
            mesa,
            cliente,
            subtotal,
            desconto,
            acrescimo,
            total,
            pagamento,
            fechado_por: usuario.user.id
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const itensFormatados = itens.map(item => ({
        venda_id: venda.id,
        produto_id: item.id,
        nome_produto: item.nome,
        preco_unitario: item.preco,
        quantidade: item.quantidade,
        observacao: item.observacao || ''
    }));

    const { error: erroItens } = await supabase
        .from('itens_venda')
        .insert(itensFormatados);

    if (erroItens) {
        throw new Error(erroItens.message);
    }

    try {
        const { data: caixa } = await supabase
            .from('caixas')
            .select('id')
            .eq('status', 'aberto')
            .maybeSingle();

        if (caixa) {
            await criarMovimentacao({
                caixaId: caixa.id,
                tipo: 'venda',
                formaPagamento: pagamento,
                descricao: `Mesa ${mesa}`,
                valor: total
            });
        }
    } catch (erro) {
        console.error(
            'Erro ao registrar venda no caixa:',
            erro
        );
    }

    return venda;
}

export async function apagarHistorico() {
    const { data: resultadoRpc, error: erroRpc } = await supabase
        .rpc('apagar_historico_vendas');

    if (erroRpc) {
        throw new Error(
            'Não foi possível excluir o histórico: ' +
            erroRpc.message
        );
    }

    // Confirma no próprio banco que nenhum registro permaneceu.
    const { count, error: erroConfirmacao } = await supabase
        .from('vendas')
        .select('id', {
            count: 'exact',
            head: true
        });

    if (erroConfirmacao) {
        throw new Error(
            'O histórico foi solicitado para exclusão, mas não foi possível confirmar o resultado. ' +
            erroConfirmacao.message
        );
    }

    if (Number(count || 0) > 0) {
        throw new Error(
            'O banco ainda possui vendas após a exclusão. Confirme se a função apagar_historico_vendas foi atualizada no projeto correto do Supabase.'
        );
    }

    return Number(resultadoRpc || 0);
}

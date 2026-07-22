import { supabase } from './supabase';

function formatarCaixa(caixa) {
    if (!caixa) {
        return null;
    }

    return {
        ...caixa,
        saldo_inicial: Number(
            caixa.saldo_inicial || 0
        ),
        saldo_final_informado:
            caixa.saldo_final_informado === null
                ? null
                : Number(
                    caixa.saldo_final_informado
                ),
        saldo_final_calculado:
            caixa.saldo_final_calculado === null
                ? null
                : Number(
                    caixa.saldo_final_calculado
                ),
        diferenca:
            caixa.diferenca === null
                ? null
                : Number(caixa.diferenca)
    };
}

function formatarMovimentacao(movimentacao) {
    return {
        ...movimentacao,
        valor: Number(
            movimentacao.valor || 0
        )
    };
}

export async function buscarCaixaAberto() {
    const { data, error } = await supabase
        .from('caixas')
        .select('*')
        .eq('status', 'aberto')
        .order('aberto_em', {
            ascending: false
        })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return formatarCaixa(data);
}

export async function abrirCaixa(
    saldoInicial
) {
    const {
        data: dadosSessao,
        error: erroSessao
    } = await supabase.auth.getUser();

    if (
        erroSessao ||
        !dadosSessao.user
    ) {
        throw new Error(
            'Usuário não autenticado.'
        );
    }

    const caixaExistente =
        await buscarCaixaAberto();

    if (caixaExistente) {
        throw new Error(
            'Já existe um caixa aberto.'
        );
    }

    const { data, error } = await supabase
        .from('caixas')
        .insert({
            aberto_por:
                dadosSessao.user.id,
            saldo_inicial: Number(
                saldoInicial || 0
            )
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return formatarCaixa(data);
}

export async function listarMovimentacoes(
    caixaId
) {
    const { data, error } = await supabase
        .from('caixa_movimentacoes')
        .select('*')
        .eq('caixa_id', caixaId)
        .order('criado_em', {
            ascending: false
        });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(
        formatarMovimentacao
    );
}

export async function criarMovimentacao({
    caixaId,
    tipo,
    descricao = '',
    formaPagamento = null,
    valor
}) {
    const {
        data: dadosSessao,
        error: erroSessao
    } = await supabase.auth.getUser();

    if (
        erroSessao ||
        !dadosSessao.user
    ) {
        throw new Error(
            'Usuário não autenticado.'
        );
    }

    const { data, error } = await supabase
        .from('caixa_movimentacoes')
        .insert({
            caixa_id: caixaId,
            tipo,
            descricao:
                descricao.trim(),
            forma_pagamento:
                formaPagamento,
            valor: Number(valor),
            criado_por:
                dadosSessao.user.id
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return formatarMovimentacao(data);
}

export function calcularResumoCaixa(
    caixa,
    movimentacoes
) {
    const resumo = {
        saldoInicial: Number(
            caixa?.saldo_inicial || 0
        ),
        vendas: 0,
        suprimentos: 0,
        sangrias: 0,
        pix: 0,
        dinheiro: 0,
        cartao: 0,
        saldoCalculado: 0,
        resultado: 0,
        quantidadeVendas: 0,
        ticketMedio: 0,
        maiorVenda: 0,
        menorVenda: 0
    };

    movimentacoes.forEach(item => {
        const valor = Number(
            item.valor || 0
        );

        if (item.tipo === 'venda') {
            resumo.vendas += valor;
            resumo.quantidadeVendas += 1;
            resumo.maiorVenda = Math.max(resumo.maiorVenda, valor);
            resumo.menorVenda = resumo.menorVenda === 0 ? valor : Math.min(resumo.menorVenda, valor);

            if (
                item.forma_pagamento ===
                'PIX'
            ) {
                resumo.pix += valor;
            }

            if (
                item.forma_pagamento ===
                'Dinheiro'
            ) {
                resumo.dinheiro += valor;
            }

            if (
                item.forma_pagamento ===
                'Cartão'
            ) {
                resumo.cartao += valor;
            }
        }

        if (
            item.tipo === 'suprimento'
        ) {
            resumo.suprimentos += valor;
        }

        if (item.tipo === 'sangria') {
            resumo.sangrias += valor;
        }
    });

    resumo.resultado = resumo.vendas + resumo.suprimentos - resumo.sangrias;
    resumo.ticketMedio = resumo.quantidadeVendas > 0
        ? resumo.vendas / resumo.quantidadeVendas
        : 0;

    resumo.saldoCalculado =
        resumo.saldoInicial +
        resumo.dinheiro +
        resumo.suprimentos -
        resumo.sangrias;

    return resumo;
}

export async function fecharCaixa({
    caixaId,
    saldoInformado,
    saldoCalculado
}) {
    const {
        data: dadosSessao,
        error: erroSessao
    } = await supabase.auth.getUser();

    if (
        erroSessao ||
        !dadosSessao.user
    ) {
        throw new Error(
            'Usuário não autenticado.'
        );
    }

    const valorInformado =
        Number(saldoInformado || 0);

    const valorCalculado =
        Number(saldoCalculado || 0);

    const { data, error } = await supabase
        .from('caixas')
        .update({
            fechado_por:
                dadosSessao.user.id,
            saldo_final_informado:
                valorInformado,
            saldo_final_calculado:
                valorCalculado,
            diferenca:
                valorInformado -
                valorCalculado,
            status: 'fechado',
            fechado_em:
                new Date().toISOString()
        })
        .eq('id', caixaId)
        .eq('status', 'aberto')
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return formatarCaixa(data);
}
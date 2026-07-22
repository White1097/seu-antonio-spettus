import { supabase } from './supabase';

function normalizarTexto(valor) {
    return String(valor || '')
        .trim()
        .toLowerCase();
}

function inicioDoDia(data) {
    const resultado = new Date(data);

    resultado.setHours(0, 0, 0, 0);

    return resultado;
}

function fimDoDia(data) {
    const resultado = new Date(data);

    resultado.setHours(23, 59, 59, 999);

    return resultado;
}

function formatarDataBanco(data) {
    return new Date(data).toISOString();
}

function converterNumero(valor) {
    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero
        : 0;
}

function obterDataVenda(venda) {
    const valorData =
        venda.criado_em ||
        venda.created_at ||
        venda.data_venda ||
        venda.data;

    if (!valorData) {
        return null;
    }

    const data = new Date(valorData);

    if (Number.isNaN(data.getTime())) {
        return null;
    }

    return data;
}

function obterNomeFuncionario(venda) {
    return (
        venda.funcionario_nome ||
        venda.nome_funcionario ||
        venda.usuario_nome ||
        venda.operador ||
        venda.perfis?.nome ||
        venda.perfis?.nome_completo ||
        'Não informado'
    );
}

function obterFormaPagamento(venda) {
    return (
        venda.forma_pagamento ||
        venda.pagamento ||
        venda.metodo_pagamento ||
        'Não informado'
    );
}

function obterTotalVenda(venda) {
    return converterNumero(
        venda.total ||
        venda.valor_total ||
        venda.total_final
    );
}

function obterQuantidadeItem(item) {
    return converterNumero(
        item.quantidade ||
        item.qtd ||
        0
    );
}

function obterPrecoItem(item) {
    return converterNumero(
        item.preco_unitario ||
        item.preco ||
        item.valor_unitario ||
        0
    );
}

function obterNomeProduto(item) {
    return (
        item.produto_nome ||
        item.nome_produto ||
        item.nome ||
        item.produtos?.nome ||
        'Produto não identificado'
    );
}

function criarChaveData(data) {
    return data.toISOString().split('T')[0];
}

function formatarDataGrafico(dataTexto) {
    const [, mes, dia] = dataTexto.split('-');

    return `${dia}/${mes}`;
}

export function obterPeriodoPorFiltro(
    filtro,
    dataInicialPersonalizada,
    dataFinalPersonalizada
) {
    const agora = new Date();

    let inicio;
    let fim;

    if (filtro === 'ontem') {
        const ontem = new Date(agora);

        ontem.setDate(ontem.getDate() - 1);

        inicio = inicioDoDia(ontem);
        fim = fimDoDia(ontem);
    } else if (filtro === 'semana') {
        const diaSemana = agora.getDay();
        const diferencaParaSegunda =
            diaSemana === 0
                ? 6
                : diaSemana - 1;

        inicio = new Date(agora);

        inicio.setDate(
            agora.getDate() -
                diferencaParaSegunda
        );

        inicio = inicioDoDia(inicio);
        fim = fimDoDia(agora);
    } else if (filtro === 'mes') {
        inicio = new Date(
            agora.getFullYear(),
            agora.getMonth(),
            1
        );

        fim = fimDoDia(agora);
    } else if (filtro === 'ultimos30') {
        inicio = new Date(agora);

        inicio.setDate(
            inicio.getDate() - 29
        );

        inicio = inicioDoDia(inicio);
        fim = fimDoDia(agora);
    } else if (
        filtro === 'personalizado' &&
        dataInicialPersonalizada &&
        dataFinalPersonalizada
    ) {
        inicio = inicioDoDia(
            new Date(
                `${dataInicialPersonalizada}T00:00:00`
            )
        );

        fim = fimDoDia(
            new Date(
                `${dataFinalPersonalizada}T00:00:00`
            )
        );
    } else {
        inicio = inicioDoDia(agora);
        fim = fimDoDia(agora);
    }

    return {
        inicio,
        fim
    };
}

export async function buscarDadosRelatorios({
    filtro = 'hoje',
    dataInicial = '',
    dataFinal = ''
} = {}) {
    const periodo = obterPeriodoPorFiltro(
        filtro,
        dataInicial,
        dataFinal
    );

    const inicioIso = formatarDataBanco(
        periodo.inicio
    );

    const fimIso = formatarDataBanco(
        periodo.fim
    );

    const {
        data: vendas,
        error: erroVendas
    } = await supabase
        .from('vendas')
        .select('*')
        .gte('criado_em', inicioIso)
        .lte('criado_em', fimIso)
        .order('criado_em', {
            ascending: true
        });

    if (erroVendas) {
        throw new Error(
            erroVendas.message ||
            'Não foi possível carregar as vendas.'
        );
    }

    const vendasLista = Array.isArray(vendas)
        ? vendas
        : [];

    const idsVendas = vendasLista
        .map(venda => venda.id)
        .filter(Boolean);

    let itensLista = [];

    if (idsVendas.length > 0) {
        const {
            data: itens,
            error: erroItens
        } = await supabase
            .from('itens_venda')
            .select('*')
            .in('venda_id', idsVendas);

        if (erroItens) {
            throw new Error(
                erroItens.message ||
                'Não foi possível carregar os itens vendidos.'
            );
        }

        itensLista = Array.isArray(itens)
            ? itens
            : [];
    }

    return montarRelatorio({
        vendas: vendasLista,
        itens: itensLista,
        periodo
    });
}

export function montarRelatorio({
    vendas = [],
    itens = [],
    periodo
}) {
    const faturamentoTotal = vendas.reduce(
        (total, venda) =>
            total + obterTotalVenda(venda),
        0
    );

    const quantidadeVendas = vendas.length;

    const ticketMedio =
        quantidadeVendas > 0
            ? faturamentoTotal /
              quantidadeVendas
            : 0;

    const quantidadeProdutos = itens.reduce(
        (total, item) =>
            total +
            obterQuantidadeItem(item),
        0
    );

    const mesasAtendidasSet = new Set();

    vendas.forEach(venda => {
        const mesa =
            venda.mesa ||
            venda.numero_mesa ||
            venda.mesa_numero;

        if (
            mesa !== null &&
            mesa !== undefined &&
            mesa !== ''
        ) {
            mesasAtendidasSet.add(
                String(mesa)
            );
        }
    });

    const formasPagamentoMapa = {};

    vendas.forEach(venda => {
        const forma =
            obterFormaPagamento(venda);

        const chave =
            normalizarTexto(forma) ||
            'não informado';

        if (!formasPagamentoMapa[chave]) {
            formasPagamentoMapa[chave] = {
                nome: forma,
                quantidade: 0,
                valor: 0
            };
        }

        formasPagamentoMapa[chave].quantidade += 1;

        formasPagamentoMapa[chave].valor +=
            obterTotalVenda(venda);
    });

    const formasPagamento = Object.values(
        formasPagamentoMapa
    )
        .map(item => ({
            ...item,
            percentual:
                faturamentoTotal > 0
                    ? (item.valor /
                          faturamentoTotal) *
                      100
                    : 0
        }))
        .sort(
            (itemA, itemB) =>
                itemB.valor - itemA.valor
        );

    const produtosMapa = {};

    itens.forEach(item => {
        const nomeProduto =
            obterNomeProduto(item);

        const chave =
            normalizarTexto(nomeProduto);

        const quantidade =
            obterQuantidadeItem(item);

        const preco =
            obterPrecoItem(item);

        const valorItem =
            converterNumero(
                item.total ||
                item.subtotal ||
                item.valor_total
            ) ||
            quantidade * preco;

        if (!produtosMapa[chave]) {
            produtosMapa[chave] = {
                nome: nomeProduto,
                quantidade: 0,
                valor: 0
            };
        }

        produtosMapa[chave].quantidade +=
            quantidade;

        produtosMapa[chave].valor +=
            valorItem;
    });

    const produtos = Object.values(
        produtosMapa
    ).sort(
        (produtoA, produtoB) =>
            produtoB.quantidade -
            produtoA.quantidade
    );

    const funcionariosMapa = {};

    vendas.forEach(venda => {
        const nomeFuncionario =
            obterNomeFuncionario(venda);

        const chave =
            normalizarTexto(
                nomeFuncionario
            );

        if (!funcionariosMapa[chave]) {
            funcionariosMapa[chave] = {
                nome: nomeFuncionario,
                quantidadeVendas: 0,
                valor: 0
            };
        }

        funcionariosMapa[
            chave
        ].quantidadeVendas += 1;

        funcionariosMapa[chave].valor +=
            obterTotalVenda(venda);
    });

    const funcionarios = Object.values(
        funcionariosMapa
    ).sort(
        (funcionarioA, funcionarioB) =>
            funcionarioB.valor -
            funcionarioA.valor
    );

    const faturamentoPorDiaMapa = {};

    const dataAtual = new Date(
        periodo.inicio
    );

    while (dataAtual <= periodo.fim) {
        const chave =
            criarChaveData(dataAtual);

        faturamentoPorDiaMapa[chave] = {
            data: chave,
            valor: 0,
            quantidadeVendas: 0
        };

        dataAtual.setDate(
            dataAtual.getDate() + 1
        );
    }

    vendas.forEach(venda => {
        const dataVenda =
            obterDataVenda(venda);

        if (!dataVenda) {
            return;
        }

        const chave =
            criarChaveData(dataVenda);

        if (!faturamentoPorDiaMapa[chave]) {
            faturamentoPorDiaMapa[chave] = {
                data: chave,
                valor: 0,
                quantidadeVendas: 0
            };
        }

        faturamentoPorDiaMapa[chave].valor +=
            obterTotalVenda(venda);

        faturamentoPorDiaMapa[
            chave
        ].quantidadeVendas += 1;
    });

    const faturamentoPorDia = Object.values(
        faturamentoPorDiaMapa
    )
        .sort(
            (itemA, itemB) =>
                itemA.data.localeCompare(
                    itemB.data
                )
        )
        .map(item => ({
            ...item,
            dataFormatada:
                formatarDataGrafico(
                    item.data
                )
        }));

    return {
        periodo: {
            inicio: periodo.inicio,
            fim: periodo.fim
        },

        resumo: {
            faturamentoTotal,
            quantidadeVendas,
            ticketMedio,
            quantidadeProdutos,
            mesasAtendidas:
                mesasAtendidasSet.size
        },

        vendas,
        itens,
        formasPagamento,
        produtos,
        funcionarios,
        faturamentoPorDia
    };
}

export function criarRelatorioVazio() {
    return {
        periodo: {
            inicio: new Date(),
            fim: new Date()
        },

        resumo: {
            faturamentoTotal: 0,
            quantidadeVendas: 0,
            ticketMedio: 0,
            quantidadeProdutos: 0,
            mesasAtendidas: 0
        },

        vendas: [],
        itens: [],
        formasPagamento: [],
        produtos: [],
        funcionarios: [],
        faturamentoPorDia: []
    };
}
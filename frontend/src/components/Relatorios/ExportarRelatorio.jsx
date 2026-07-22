import { useState } from 'react';

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatarData(valor) {
    if (!valor) {
        return 'Não informada';
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return 'Não informada';
    }

    return data.toLocaleString('pt-BR');
}

function obterDataVenda(venda) {
    return (
        venda.criado_em ||
        venda.created_at ||
        venda.data_venda ||
        venda.data ||
        null
    );
}

function obterMesa(venda) {
    return (
        venda.mesa ||
        venda.numero_mesa ||
        venda.mesa_numero ||
        '-'
    );
}

function obterCliente(venda) {
    return (
        venda.cliente ||
        venda.nome_cliente ||
        'Não informado'
    );
}

function obterPagamento(venda) {
    return (
        venda.forma_pagamento ||
        venda.pagamento ||
        venda.metodo_pagamento ||
        'Não informado'
    );
}

function obterFuncionario(venda) {
    return (
        venda.funcionario_nome ||
        venda.nome_funcionario ||
        venda.usuario_nome ||
        venda.operador ||
        'Não informado'
    );
}

function obterTotalVenda(venda) {
    return Number(
        venda.total ||
        venda.valor_total ||
        venda.total_final ||
        0
    );
}

function criarNomeArquivo(extensao) {
    const agora = new Date();

    const data = agora
        .toLocaleDateString('pt-BR')
        .replaceAll('/', '-');

    const horario = agora
        .toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })
        .replace(':', '-');

    return `relatorio-seu-antonio-${data}-${horario}.${extensao}`;
}

function baixarArquivo(conteudo, nome, tipo) {
    const arquivo = new Blob([conteudo], {
        type: tipo
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');

    link.href = url;
    link.download = nome;

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function protegerCelulaCsv(valor) {
    const texto = String(valor ?? '');

    const textoProtegido =
        /^[=+\-@]/.test(texto)
            ? `'${texto}`
            : texto;

    return `"${textoProtegido.replaceAll('"', '""')}"`;
}

function criarCsv(relatorio) {
    const {
        resumo,
        vendas = [],
        formasPagamento = [],
        produtos = [],
        funcionarios = [],
        periodo
    } = relatorio;

    const linhas = [];

    linhas.push([
        'RELATÓRIO — SEU ANTÔNIO SPETTUS'
    ]);

    linhas.push([]);

    linhas.push([
        'Período inicial',
        new Date(periodo.inicio).toLocaleDateString('pt-BR')
    ]);

    linhas.push([
        'Período final',
        new Date(periodo.fim).toLocaleDateString('pt-BR')
    ]);

    linhas.push([]);

    linhas.push([
        'RESUMO GERAL'
    ]);

    linhas.push([
        'Faturamento',
        formatarMoeda(resumo.faturamentoTotal)
    ]);

    linhas.push([
        'Quantidade de vendas',
        resumo.quantidadeVendas
    ]);

    linhas.push([
        'Ticket médio',
        formatarMoeda(resumo.ticketMedio)
    ]);

    linhas.push([
        'Produtos vendidos',
        resumo.quantidadeProdutos
    ]);

    linhas.push([
        'Mesas atendidas',
        resumo.mesasAtendidas
    ]);

    linhas.push([]);

    linhas.push([
        'FORMAS DE PAGAMENTO'
    ]);

    linhas.push([
        'Forma',
        'Quantidade',
        'Valor',
        'Percentual'
    ]);

    formasPagamento.forEach(item => {
        linhas.push([
            item.nome,
            item.quantidade,
            formatarMoeda(item.valor),
            `${Number(item.percentual || 0)
                .toFixed(1)
                .replace('.', ',')}%`
        ]);
    });

    linhas.push([]);

    linhas.push([
        'PRODUTOS MAIS VENDIDOS'
    ]);

    linhas.push([
        'Posição',
        'Produto',
        'Quantidade',
        'Faturamento'
    ]);

    produtos.forEach((produto, indice) => {
        linhas.push([
            `${indice + 1}º`,
            produto.nome,
            produto.quantidade,
            formatarMoeda(produto.valor)
        ]);
    });

    linhas.push([]);

    linhas.push([
        'RANKING DE FUNCIONÁRIOS'
    ]);

    linhas.push([
        'Posição',
        'Funcionário',
        'Quantidade de vendas',
        'Faturamento'
    ]);

    funcionarios.forEach((funcionario, indice) => {
        linhas.push([
            `${indice + 1}º`,
            funcionario.nome,
            funcionario.quantidadeVendas,
            formatarMoeda(funcionario.valor)
        ]);
    });

    linhas.push([]);

    linhas.push([
        'VENDAS DO PERÍODO'
    ]);

    linhas.push([
        'Data',
        'Mesa',
        'Cliente',
        'Pagamento',
        'Funcionário',
        'Total'
    ]);

    vendas.forEach(venda => {
        linhas.push([
            formatarData(obterDataVenda(venda)),
            obterMesa(venda),
            obterCliente(venda),
            obterPagamento(venda),
            obterFuncionario(venda),
            formatarMoeda(obterTotalVenda(venda))
        ]);
    });

    return linhas
        .map(linha =>
            linha
                .map(protegerCelulaCsv)
                .join(';')
        )
        .join('\n');
}

function criarHtmlRelatorio(relatorio) {
    const {
        resumo,
        vendas = [],
        formasPagamento = [],
        produtos = [],
        funcionarios = [],
        periodo
    } = relatorio;

    const linhasPagamentos = formasPagamento
        .map(
            item => `
                <tr>
                    <td>${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>${formatarMoeda(item.valor)}</td>
                    <td>
                        ${Number(item.percentual || 0)
                            .toFixed(1)
                            .replace('.', ',')}%
                    </td>
                </tr>
            `
        )
        .join('');

    const linhasProdutos = produtos
        .slice(0, 20)
        .map(
            (produto, indice) => `
                <tr>
                    <td>${indice + 1}º</td>
                    <td>${produto.nome}</td>
                    <td>${produto.quantidade}</td>
                    <td>${formatarMoeda(produto.valor)}</td>
                </tr>
            `
        )
        .join('');

    const linhasFuncionarios = funcionarios
        .slice(0, 20)
        .map(
            (funcionario, indice) => `
                <tr>
                    <td>${indice + 1}º</td>
                    <td>${funcionario.nome}</td>
                    <td>${funcionario.quantidadeVendas}</td>
                    <td>${formatarMoeda(funcionario.valor)}</td>
                </tr>
            `
        )
        .join('');

    const linhasVendas = vendas
        .map(
            venda => `
                <tr>
                    <td>${formatarData(obterDataVenda(venda))}</td>
                    <td>${obterMesa(venda)}</td>
                    <td>${obterCliente(venda)}</td>
                    <td>${obterPagamento(venda)}</td>
                    <td>${obterFuncionario(venda)}</td>
                    <td>${formatarMoeda(obterTotalVenda(venda))}</td>
                </tr>
            `
        )
        .join('');

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
            <head>
                <meta charset="UTF-8" />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />

                <title>
                    Relatório — Seu Antônio Spettus
                </title>

                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 32px;
                        font-family: Arial, sans-serif;
                        color: #251b25;
                        background: #ffffff;
                    }

                    h1,
                    h2 {
                        color: #3a083e;
                    }

                    h1 {
                        margin-bottom: 4px;
                    }

                    .periodo {
                        margin-bottom: 28px;
                        color: #6d626d;
                    }

                    .cards {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 12px;
                        margin-bottom: 28px;
                    }

                    .card {
                        padding: 16px;
                        border: 1px solid #ded6df;
                        border-radius: 12px;
                    }

                    .card span {
                        display: block;
                        margin-bottom: 8px;
                        color: #746b74;
                        font-size: 12px;
                    }

                    .card strong {
                        color: #3a083e;
                        font-size: 19px;
                    }

                    section {
                        margin-top: 30px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }

                    th,
                    td {
                        padding: 9px;
                        border: 1px solid #ded6df;
                        text-align: left;
                    }

                    th {
                        color: #ffffff;
                        background: #3a083e;
                    }

                    tr:nth-child(even) {
                        background: #f8f5f8;
                    }
                </style>
            </head>

            <body>
                <h1>Seu Antônio Spettus</h1>

                <div class="periodo">
                    Relatório de
                    ${new Date(periodo.inicio).toLocaleDateString('pt-BR')}
                    até
                    ${new Date(periodo.fim).toLocaleDateString('pt-BR')}
                </div>

                <div class="cards">
                    <div class="card">
                        <span>Faturamento</span>
                        <strong>
                            ${formatarMoeda(resumo.faturamentoTotal)}
                        </strong>
                    </div>

                    <div class="card">
                        <span>Vendas</span>
                        <strong>
                            ${resumo.quantidadeVendas}
                        </strong>
                    </div>

                    <div class="card">
                        <span>Ticket médio</span>
                        <strong>
                            ${formatarMoeda(resumo.ticketMedio)}
                        </strong>
                    </div>

                    <div class="card">
                        <span>Produtos vendidos</span>
                        <strong>
                            ${resumo.quantidadeProdutos}
                        </strong>
                    </div>

                    <div class="card">
                        <span>Mesas atendidas</span>
                        <strong>
                            ${resumo.mesasAtendidas}
                        </strong>
                    </div>
                </div>

                <section>
                    <h2>Formas de pagamento</h2>

                    <table>
                        <thead>
                            <tr>
                                <th>Forma</th>
                                <th>Quantidade</th>
                                <th>Valor</th>
                                <th>Percentual</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${linhasPagamentos}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h2>Produtos mais vendidos</h2>

                    <table>
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Faturamento</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${linhasProdutos}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h2>Ranking de funcionários</h2>

                    <table>
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Funcionário</th>
                                <th>Vendas</th>
                                <th>Faturamento</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${linhasFuncionarios}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h2>Vendas do período</h2>

                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Mesa</th>
                                <th>Cliente</th>
                                <th>Pagamento</th>
                                <th>Funcionário</th>
                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${linhasVendas}
                        </tbody>
                    </table>
                </section>
            </body>
        </html>
    `;
}

export default function ExportarRelatorio({
    relatorio,
    desabilitado = false
}) {
    const [exportando, setExportando] =
        useState(false);

    function exportarExcel() {
        if (!relatorio || desabilitado) {
            return;
        }

        try {
            setExportando(true);

            const csv = criarCsv(relatorio);

            const conteudo = `\uFEFF${csv}`;

            baixarArquivo(
                conteudo,
                criarNomeArquivo('csv'),
                'text/csv;charset=utf-8'
            );
        } catch (erro) {
            console.error(erro);

            window.alert(
                'Não foi possível exportar o relatório para Excel.'
            );
        } finally {
            setExportando(false);
        }
    }


    function imprimirOuSalvarPdf() {
        if (!relatorio || desabilitado) {
            return;
        }

        try {
            const html = criarHtmlRelatorio(relatorio);
            const janela = window.open('', '_blank', 'noopener,noreferrer');

            if (!janela) {
                throw new Error('O navegador bloqueou a janela de impressão.');
            }

            janela.document.open();
            janela.document.write(html);
            janela.document.close();
            janela.focus();

            window.setTimeout(() => {
                janela.print();
            }, 350);
        } catch (erro) {
            console.error(erro);
            window.alert(erro.message || 'Não foi possível abrir a impressão do relatório.');
        }
    }

    function exportarRelatorioCompleto() {
        if (!relatorio || desabilitado) {
            return;
        }

        try {
            setExportando(true);

            const html =
                criarHtmlRelatorio(relatorio);

            baixarArquivo(
                html,
                criarNomeArquivo('html'),
                'text/html;charset=utf-8'
            );
        } catch (erro) {
            console.error(erro);

            window.alert(
                'Não foi possível exportar o relatório completo.'
            );
        } finally {
            setExportando(false);
        }
    }

    return (
        <div className="relatorios-exportacao">
            <button
                type="button"
                className="relatorios-botao-exportar"
                onClick={exportarExcel}
                disabled={
                    desabilitado ||
                    exportando
                }
            >
                {exportando
                    ? 'Exportando...'
                    : 'Exportar Excel'}
            </button>


            <button
                type="button"
                className="relatorios-botao-exportar relatorios-botao-exportar-secundario"
                onClick={imprimirOuSalvarPdf}
                disabled={desabilitado || exportando}
            >
                Imprimir / Salvar PDF
            </button>

            <button
                type="button"
                className="relatorios-botao-exportar relatorios-botao-exportar-secundario"
                onClick={exportarRelatorioCompleto}
                disabled={
                    desabilitado ||
                    exportando
                }
            >
                Exportar relatório
            </button>
        </div>
    );
}
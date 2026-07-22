import Layout from '../../components/Layout/Layout';

import RelatorioCards from '../../components/Relatorios/RelatorioCards';
import RelatorioFiltros from '../../components/Relatorios/RelatorioFiltros';
import GraficoFaturamento from '../../components/Relatorios/GraficoFaturamento';
import GraficoPagamento from '../../components/Relatorios/GraficoPagamento';
import ProdutosMaisVendidos from '../../components/Relatorios/ProdutosMaisVendidos';
import FuncionariosRanking from '../../components/Relatorios/FuncionariosRanking';
import ExportarRelatorio from '../../components/Relatorios/ExportarRelatorio';

import useRelatorios from '../../hooks/useRelatorios';

import './Relatorios.css';

function Relatorios({
    mudarPaginaSistema,
    voltarDashboard
}) {
    const {
        relatorio,
        carregando,
        erro,
        filtro,
        dataInicial,
        dataFinal,
        atualizarFiltro,
        carregarRelatorio
    } = useRelatorios();

    const {
        resumo,
        vendas,
        formasPagamento,
        produtos,
        funcionarios,
        faturamentoPorDia,
        periodo
    } = relatorio;

    function mudarPagina(pagina) {
        if (pagina === 'relatorios') {
            return;
        }

        if (typeof mudarPaginaSistema === 'function') {
            mudarPaginaSistema(pagina);
            return;
        }

        if (
            pagina === 'dashboard' ||
            pagina === 'mesas' ||
            pagina === 'comandas'
        ) {
            voltarDashboard?.();
        }
    }

    function formatarData(data) {
        if (!data) {
            return 'Não informada';
        }

        const objetoData = new Date(data);

        if (Number.isNaN(objetoData.getTime())) {
            return String(data);
        }

        return objetoData.toLocaleString('pt-BR');
    }

    function formatarPeriodo(data) {
        if (!data) {
            return 'Não informado';
        }

        const objetoData = new Date(data);

        if (Number.isNaN(objetoData.getTime())) {
            return String(data);
        }

        return objetoData.toLocaleDateString(
            'pt-BR'
        );
    }

    return (
        <Layout
            paginaAtual="relatorios"
            mudarPagina={mudarPagina}
            titulo="Relatórios"
        >
            <section className="relatorios-pagina">
                <header className="relatorios-cabecalho">
                    <div className="relatorios-cabecalho-texto">
                        <span className="relatorios-etiqueta">
                            Gestão e desempenho
                        </span>

                        <h2>
                            Relatórios do restaurante
                        </h2>

                        <p>
                            Acompanhe o faturamento, as vendas,
                            as formas de pagamento, os produtos
                            e o desempenho da equipe.
                        </p>
                    </div>

                    <div className="relatorios-cabecalho-acoes">
                        <button
                            type="button"
                            className="relatorios-botao-atualizar"
                            onClick={carregarRelatorio}
                            disabled={carregando}
                        >
                            {carregando
                                ? 'Atualizando...'
                                : 'Atualizar dados'}
                        </button>

                        <ExportarRelatorio
                            relatorio={relatorio}
                            desabilitado={
                                carregando ||
                                vendas.length === 0
                            }
                        />
                    </div>
                </header>

                <RelatorioFiltros
                    filtro={filtro}
                    dataInicial={dataInicial}
                    dataFinal={dataFinal}
                    atualizarFiltro={atualizarFiltro}
                    carregando={carregando}
                />

                {erro && (
                    <section className="relatorios-mensagem relatorios-mensagem-erro">
                        <strong>
                            Não foi possível carregar os relatórios.
                        </strong>

                        <span>
                            {erro}
                        </span>

                        <button
                            type="button"
                            onClick={carregarRelatorio}
                        >
                            Tentar novamente
                        </button>
                    </section>
                )}

                {carregando && !erro && (
                    <section className="relatorios-carregando">
                        <div className="relatorios-carregando-icone" />

                        <strong>
                            Carregando relatórios...
                        </strong>

                        <span>
                            Aguarde enquanto os dados são
                            consultados no Supabase.
                        </span>
                    </section>
                )}

                {!carregando && !erro && (
                    <>
                        <RelatorioCards
                            faturamentoTotal={
                                resumo.faturamentoTotal
                            }
                            quantidadeVendas={
                                resumo.quantidadeVendas
                            }
                            ticketMedio={
                                resumo.ticketMedio
                            }
                            quantidadeProdutos={
                                resumo.quantidadeProdutos
                            }
                            mesasAtendidas={
                                resumo.mesasAtendidas
                            }
                        />

                        {vendas.length === 0 ? (
                            <section className="relatorios-sem-dados">
                                <div className="relatorios-sem-dados-icone">
                                    📊
                                </div>

                                <h3>
                                    Nenhuma venda encontrada
                                </h3>

                                <p>
                                    Ainda não existem vendas
                                    registradas no período
                                    selecionado.
                                </p>
                            </section>
                        ) : (
                            <>
                                <section className="relatorios-graficos-grid">
                                    <GraficoFaturamento
                                        dados={
                                            faturamentoPorDia
                                        }
                                    />

                                    <GraficoPagamento
                                        dados={
                                            formasPagamento
                                        }
                                    />
                                </section>

                                <section className="relatorios-tabelas-grid">
                                    <ProdutosMaisVendidos
                                        produtos={produtos}
                                    />

                                    <FuncionariosRanking
                                        funcionarios={
                                            funcionarios
                                        }
                                    />
                                </section>

                                <section className="relatorios-vendas-secao">
                                    <div className="relatorios-secao-cabecalho">
                                        <div>
                                            <span>
                                                Movimentações
                                            </span>

                                            <h3>
                                                Vendas do período
                                            </h3>
                                        </div>

                                        <strong>
                                            {vendas.length}{' '}
                                            {vendas.length === 1
                                                ? 'venda'
                                                : 'vendas'}
                                        </strong>
                                    </div>

                                    <div className="relatorios-tabela-container">
                                        <table className="relatorios-tabela">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Data
                                                    </th>

                                                    <th>
                                                        Mesa
                                                    </th>

                                                    <th>
                                                        Cliente
                                                    </th>

                                                    <th>
                                                        Pagamento
                                                    </th>

                                                    <th>
                                                        Funcionário
                                                    </th>

                                                    <th className="relatorios-coluna-valor">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {vendas.map(
                                                    venda => {
                                                        const dataVenda =
                                                            venda.criado_em ||
                                                            venda.created_at ||
                                                            venda.data_venda ||
                                                            venda.data;

                                                        const mesa =
                                                            venda.mesa ||
                                                            venda.numero_mesa ||
                                                            venda.mesa_numero ||
                                                            '-';

                                                        const cliente =
                                                            venda.cliente ||
                                                            venda.nome_cliente ||
                                                            'Não informado';

                                                        const pagamento =
                                                            venda.forma_pagamento ||
                                                            venda.pagamento ||
                                                            venda.metodo_pagamento ||
                                                            'Não informado';

                                                        const funcionario =
                                                            venda.funcionario_nome ||
                                                            venda.nome_funcionario ||
                                                            venda.usuario_nome ||
                                                            venda.operador ||
                                                            'Não informado';

                                                        const total =
                                                            Number(
                                                                venda.total ||
                                                                    venda.valor_total ||
                                                                    venda.total_final ||
                                                                    0
                                                            );

                                                        return (
                                                            <tr
                                                                key={
                                                                    venda.id
                                                                }
                                                            >
                                                                <td>
                                                                    {formatarData(
                                                                        dataVenda
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {mesa}
                                                                </td>

                                                                <td>
                                                                    {cliente}
                                                                </td>

                                                                <td>
                                                                    <span className="relatorios-pagamento">
                                                                        {
                                                                            pagamento
                                                                        }
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    {
                                                                        funcionario
                                                                    }
                                                                </td>

                                                                <td className="relatorios-coluna-valor">
                                                                    {total.toLocaleString(
                                                                        'pt-BR',
                                                                        {
                                                                            style:
                                                                                'currency',
                                                                            currency:
                                                                                'BRL'
                                                                        }
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </>
                        )}

                        <footer className="relatorios-rodape">
                            <span>
                                Período analisado:
                            </span>

                            <strong>
                                {formatarPeriodo(
                                    periodo.inicio
                                )}
                                {' até '}
                                {formatarPeriodo(
                                    periodo.fim
                                )}
                            </strong>
                        </footer>
                    </>
                )}
            </section>
        </Layout>
    );
}

export default Relatorios;
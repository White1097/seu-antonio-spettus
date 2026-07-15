import { useMemo } from 'react';

import Layout from '../../components/Layout/Layout';
import DashboardCards from '../../components/DashboardCards/DashboardCards';
import MesaCard from '../../components/MesaCard/MesaCard';

import { useAuth } from '../../context/AuthContext';

import './Dashboard.css';

function Dashboard({
    comandas = {},
    vendas = [],
    abrirComanda,
    abrirHistorico,
    abrirProdutos
}) {

    const { cargo } = useAuth();

    const mesas = [
        1,2,3,4,
        5,6,7,8
    ];

    function itensDaMesa(numeroMesa){

        const itens = comandas[numeroMesa]?.itens;

        return Array.isArray(itens)
            ? itens
            : [];

    }

    function totalDaMesa(numeroMesa){

        return itensDaMesa(numeroMesa).reduce(
            (total,item)=>{

                return (
                    total +
                    Number(item.preco || 0) *
                    Number(item.quantidade || 0)
                );

            },
            0
        );

    }

    function quantidadeDaMesa(numeroMesa){

        return itensDaMesa(numeroMesa).reduce(
            (total,item)=>{

                return (
                    total +
                    Number(item.quantidade || 0)
                );

            },
            0
        );

    }

    function mesaOcupada(numeroMesa){

        return itensDaMesa(numeroMesa).length > 0;

    }

    const mesasOcupadas = useMemo(()=>{

        return mesas.filter(
            mesaOcupada
        ).length;

    },[comandas]);

    const faturamentoHoje = useMemo(()=>{

        return vendas.reduce(
            (total,venda)=>{

                return (
                    total +
                    Number(venda.total || 0)
                );

            },
            0
        );

    },[vendas]);

    const mostrarFinanceiro =
        cargo === 'caixa' ||
        cargo === 'administrador';

    const mostrarFuncionarios =
        cargo === 'administrador';

    function mudarPagina(pagina){

        if(
            pagina === 'dashboard' ||
            pagina === 'mesas' ||
            pagina === 'comandas'
        ){
            return;
        }

        if(pagina === 'cardapio'){
            abrirProdutos();
            return;
        }

        if(pagina === 'historico'){
            abrirHistorico();
            return;
        }

        window.alert(
            'Essa tela será criada nas próximas etapas.'
        );

    }
        return (
        <Layout
            paginaAtual="dashboard"
            mudarPagina={mudarPagina}
            titulo="Dashboard"
        >
            <section className="dashboard-novo">
                <header className="dashboard-apresentacao">
                    <div>
                        <span className="dashboard-etiqueta">
                            Visão geral
                        </span>

                        <h2>
                            Controle do restaurante
                        </h2>

                        <p>
                            Acompanhe as mesas, comandas e vendas
                            do Seu Antônio Spettus.
                        </p>
                    </div>

                    <div className="dashboard-status">
                        <span className="dashboard-status-ponto" />
                        Sistema online
                    </div>
                </header>

                <DashboardCards
                    totalMesas={8}
                    mesasOcupadas={mesasOcupadas}
                    faturamentoHoje={faturamentoHoje}
                    contasFechadas={vendas.length}
                    totalFuncionarios={1}
                    mostrarFinanceiro={mostrarFinanceiro}
                    mostrarFuncionarios={mostrarFuncionarios}
                />

                <section className="dashboard-area-principal">
                    <div className="dashboard-mesas-secao">
                        <div className="dashboard-secao-cabecalho">
                            <div>
                                <span>
                                    Atendimento
                                </span>

                                <h3>
                                    Mesas do restaurante
                                </h3>
                            </div>

                            <div className="dashboard-legenda">
                                <span>
                                    <i className="legenda-livre" />
                                    Livre
                                </span>

                                <span>
                                    <i className="legenda-ocupada" />
                                    Ocupada
                                </span>
                            </div>
                        </div>

                        <div className="dashboard-mesas-grid">
                            {mesas.map(numeroMesa => {
                                const comanda =
                                    comandas[numeroMesa] || {};

                                const ocupada =
                                    mesaOcupada(numeroMesa);

                                return (
                                    <MesaCard
                                        key={numeroMesa}
                                        numero={numeroMesa}
                                        cliente={
                                            comanda.cliente || ''
                                        }
                                        total={
                                            totalDaMesa(numeroMesa)
                                        }
                                        quantidadeItens={
                                            quantidadeDaMesa(numeroMesa)
                                        }
                                        ocupada={ocupada}
                                        atualizadoEm={
                                            comanda.atualizado_em ||
                                            comanda.atualizadoEm ||
                                            null
                                        }
                                        onClick={() =>
                                            abrirComanda(numeroMesa)
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <aside className="dashboard-painel-lateral">
                        <div className="dashboard-painel-titulo">
                            <span>
                                Resumo
                            </span>

                            <h3>
                                Movimento atual
                            </h3>
                        </div>

                        <div className="dashboard-indicador">
                            <span>
                                Mesas livres
                            </span>

                            <strong>
                                {8 - mesasOcupadas}
                            </strong>
                        </div>

                        <div className="dashboard-indicador">
                            <span>
                                Mesas ocupadas
                            </span>

                            <strong>
                                {mesasOcupadas}
                            </strong>
                        </div>

                        <div className="dashboard-indicador">
                            <span>
                                Total em aberto
                            </span>

                            <strong>
                                {mesas
                                    .reduce(
                                        (total, numeroMesa) =>
                                            total +
                                            totalDaMesa(numeroMesa),
                                        0
                                    )
                                    .toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    })}
                            </strong>
                        </div>

                        {mostrarFinanceiro && (
                            <button
                                type="button"
                                className="dashboard-botao-historico"
                                onClick={abrirHistorico}
                            >
                                Ver histórico de vendas
                            </button>
                        )}
                    </aside>
                </section>

                {mostrarFinanceiro && (
                    <section className="dashboard-ultimas-vendas">
                        <div className="dashboard-secao-cabecalho">
                            <div>
                                <span>
                                    Movimentações
                                </span>

                                <h3>
                                    Últimas contas fechadas
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={abrirHistorico}
                            >
                                Ver todas
                            </button>
                        </div>

                        {vendas.length === 0 ? (
                            <div className="dashboard-sem-vendas">
                                Nenhuma venda fechada ainda.
                            </div>
                        ) : (
                            <div className="dashboard-vendas-lista">
                                {vendas
                                    .slice(0, 5)
                                    .map(venda => (
                                        <article
                                            key={venda.id}
                                            className="dashboard-venda-item"
                                        >
                                            <div>
                                                <strong>
                                                    Mesa {venda.mesa}
                                                </strong>

                                                <span>
                                                    {venda.cliente ||
                                                        'Cliente não informado'}
                                                </span>
                                            </div>

                                            <div>
                                                <span>
                                                    {venda.pagamento}
                                                </span>

                                                <strong>
                                                    {Number(
                                                        venda.total || 0
                                                    ).toLocaleString(
                                                        'pt-BR',
                                                        {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }
                                                    )}
                                                </strong>
                                            </div>
                                        </article>
                                    ))}
                            </div>
                        )}
                    </section>
                )}
            </section>
        </Layout>
    );
}

export default Dashboard;
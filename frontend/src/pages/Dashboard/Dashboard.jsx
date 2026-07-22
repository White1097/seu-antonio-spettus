import { useMemo, useState } from 'react';

import Layout from '../../components/Layout/Layout';
import DashboardCards from '../../components/DashboardCards/DashboardCards';
import MesaCard from '../../components/MesaCard/MesaCard';

import { useAuth } from '../../context/AuthContext';
import { useMesas } from '../../hooks/useMesas';
import { useMetaDiaria } from '../../hooks/useMetaDiaria';
import { useTheme } from '../../context/ThemeContext';

import './Dashboard.css';

function Dashboard({
    comandas = {},
    vendas = [],
    abrirComanda,
    abrirHistorico,
    abrirProdutos,
    abrirConfiguracoesMesas,
    abrirFuncionarios,
    abrirCaixa,
    abrirRelatorios,
    mudarPaginaSistema
}) {
    const { cargo } = useAuth();
    const { metaDiaria } = useMetaDiaria();
    const { nomeSistema } = useTheme();
    const [filtroMesas, setFiltroMesas] = useState('todas');

    const {
        mesas,
        carregando: carregandoMesas,
        erro: erroMesas
    } = useMesas();

    const mesasAtivas = useMemo(() => {
        return mesas
            .filter(mesa => mesa.ativa)
            .sort(
                (mesaA, mesaB) =>
                    Number(mesaA.ordem) -
                    Number(mesaB.ordem)
            );
    }, [mesas]);

    const numerosMesas = useMemo(() => {
        return mesasAtivas.map(
            mesa => Number(mesa.numero)
        );
    }, [mesasAtivas]);

    function itensDaMesa(numeroMesa) {
        const itens =
            comandas[numeroMesa]?.itens;

        return Array.isArray(itens)
            ? itens
            : [];
    }

    function totalDaMesa(numeroMesa) {
        return itensDaMesa(numeroMesa).reduce(
            (total, item) => {
                return (
                    total +
                    Number(item.preco || 0) *
                    Number(item.quantidade || 0)
                );
            },
            0
        );
    }

    function quantidadeDaMesa(numeroMesa) {
        return itensDaMesa(numeroMesa).reduce(
            (total, item) => {
                return (
                    total +
                    Number(item.quantidade || 0)
                );
            },
            0
        );
    }

    function mesaEstaOcupada(numeroMesa) {
        return itensDaMesa(numeroMesa).length > 0;
    }

    const resumoMesas = useMemo(() => {
        return numerosMesas.reduce(
            (resumo, numeroMesa) => {
                const itens = Array.isArray(
                    comandas[numeroMesa]?.itens
                )
                    ? comandas[numeroMesa].itens
                    : [];

                const totalMesa = itens.reduce(
                    (total, item) =>
                        total +
                        Number(item.preco || 0) *
                            Number(item.quantidade || 0),
                    0
                );

                return {
                    ocupadas:
                        resumo.ocupadas +
                        (itens.length > 0 ? 1 : 0),
                    totalEmAberto:
                        resumo.totalEmAberto + totalMesa
                };
            },
            {
                ocupadas: 0,
                totalEmAberto: 0
            }
        );
    }, [comandas, numerosMesas]);

    const mesasOcupadas = resumoMesas.ocupadas;
    const totalEmAberto = resumoMesas.totalEmAberto;

    const mesasFiltradas = useMemo(() => {
        const ocupada = (numero) => {
            const itens = comandas[Number(numero)]?.itens;
            return Array.isArray(itens) && itens.length > 0;
        };

        if (filtroMesas === 'ocupadas') {
            return mesasAtivas.filter(mesa => ocupada(mesa.numero));
        }
        if (filtroMesas === 'livres') {
            return mesasAtivas.filter(mesa => !ocupada(mesa.numero));
        }
        return mesasAtivas;
    }, [filtroMesas, mesasAtivas, comandas]);

    const vendasDeHoje = useMemo(() => {
        const hoje = new Date();

        return vendas.filter(venda => {
            if (
                !venda.criado_em &&
                !venda.data
            ) {
                return true;
            }

            let dataVenda;

            if (venda.criado_em) {
                dataVenda = new Date(
                    venda.criado_em
                );
            } else {
                const textoData =
                    String(venda.data)
                        .split(',')[0]
                        .trim();

                const partes =
                    textoData.split('/');

                if (partes.length === 3) {
                    dataVenda = new Date(
                        Number(partes[2]),
                        Number(partes[1]) - 1,
                        Number(partes[0])
                    );
                }
            }

            if (
                !dataVenda ||
                Number.isNaN(
                    dataVenda.getTime()
                )
            ) {
                return true;
            }

            return (
                dataVenda.getDate() ===
                    hoje.getDate() &&
                dataVenda.getMonth() ===
                    hoje.getMonth() &&
                dataVenda.getFullYear() ===
                    hoje.getFullYear()
            );
        });
    }, [vendas]);

    const faturamentoHoje = useMemo(() => {
        return vendasDeHoje.reduce(
            (total, venda) => {
                return (
                    total +
                    Number(venda.total || 0)
                );
            },
            0
        );
    }, [vendasDeHoje]);

    const mostrarFinanceiro =
        cargo === 'caixa' ||
        cargo === 'administrador';

    const mostrarFuncionarios =
        cargo === 'administrador';

    function mudarPagina(pagina) {
        if (typeof mudarPaginaSistema === 'function') {
            mudarPaginaSistema(pagina);
            return;
        }

        if (
            pagina === 'dashboard' ||
            pagina === 'mesas' ||
            pagina === 'comandas'
        ) {
            return;
        }

        if (pagina === 'cardapio') {
            abrirProdutos();
            return;
        }

        if (pagina === 'historico') {
            abrirHistorico();
            return;
        }

        if (pagina === 'caixa') {
            abrirCaixa();
            return;
        }

        if (pagina === 'funcionarios') {
            abrirFuncionarios();
            return;
        }

        if (pagina === 'configuracoes') {
            abrirConfiguracoesMesas();
            return;
        }

        if (pagina === 'relatorios') {
            abrirRelatorios();
        }
    }

    return (
        <Layout
            paginaAtual="dashboard"
            mudarPagina={mudarPagina}
            titulo="Dashboard"
        >
            <section className="dashboard-novo">
                {carregandoMesas && (
                    <div className="dashboard-carregando-mesas">
                        Carregando mesas...
                    </div>
                )}

                {erroMesas && (
                    <div className="dashboard-erro-mesas">
                        {erroMesas}
                    </div>
                )}

                <header className="dashboard-apresentacao">
                    <div>
                        <span className="dashboard-etiqueta">
                            Visão geral
                        </span>

                        <h2>
                            Controle do restaurante
                        </h2>

                        <p>
                            Acompanhe as mesas, comandas e
                            vendas do {nomeSistema}.
                        </p>
                    </div>

                    <div className="dashboard-status">
                        <span className="dashboard-status-ponto" />

                        Sistema online
                    </div>
                </header>

                <DashboardCards
                    totalMesas={mesasAtivas.length}
                    mesasOcupadas={mesasOcupadas}
                    faturamentoHoje={faturamentoHoje}
                    contasFechadas={vendasDeHoje.length}
                    totalFuncionarios={1}
                    metaDiaria={metaDiaria}
                    mostrarFinanceiro={
                        mostrarFinanceiro
                    }
                    mostrarFuncionarios={
                        mostrarFuncionarios
                    }
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

                            <div className="dashboard-filtros-mesas" role="group" aria-label="Filtrar mesas">
                                <button type="button" className={filtroMesas === 'todas' ? 'ativo' : ''} onClick={() => setFiltroMesas('todas')}>Todas</button>
                                <button type="button" className={filtroMesas === 'livres' ? 'ativo' : ''} onClick={() => setFiltroMesas('livres')}>Livres</button>
                                <button type="button" className={filtroMesas === 'ocupadas' ? 'ativo' : ''} onClick={() => setFiltroMesas('ocupadas')}>Ocupadas</button>
                            </div>
                        </div>

                        {!carregandoMesas &&
                        mesasAtivas.length === 0 ? (
                            <div className="dashboard-sem-mesas">
                                Nenhuma mesa ativa cadastrada.
                            </div>
                        ) : (
                            <div className="dashboard-mesas-grid">
                                {mesasFiltradas.map(mesa => {
                                    const numeroMesa =
                                        Number(mesa.numero);

                                    const comanda =
                                        comandas[
                                            numeroMesa
                                        ] || {};

                                    const ocupada =
                                        mesaEstaOcupada(
                                            numeroMesa
                                        );

                                    return (
                                        <MesaCard
                                            key={mesa.id}
                                            numero={
                                                numeroMesa
                                            }
                                            nome={
                                                mesa.nome
                                            }
                                            cliente={
                                                comanda.cliente ||
                                                ''
                                            }
                                            total={
                                                totalDaMesa(
                                                    numeroMesa
                                                )
                                            }
                                            quantidadeItens={
                                                quantidadeDaMesa(
                                                    numeroMesa
                                                )
                                            }
                                            ocupada={
                                                ocupada
                                            }
                                            garcom={
                                                comanda.funcionario_nome ||
                                                comanda.garcom ||
                                                comanda.atendente ||
                                                ''
                                            }
                                            abertoEm={
                                                comanda.criado_em ||
                                                comanda.created_at ||
                                                comanda.aberto_em ||
                                                null
                                            }
                                            atualizadoEm={
                                                comanda.atualizado_em ||
                                                comanda.atualizadoEm ||
                                                mesa.atualizado_em ||
                                                null
                                            }
                                            onClick={() =>
                                                abrirComanda(
                                                    numeroMesa
                                                )
                                            }
                                        />
                                    );
                                })}
                            </div>
                        )}
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
                                Total de mesas
                            </span>

                            <strong>
                                {mesasAtivas.length}
                            </strong>
                        </div>

                        <div className="dashboard-indicador">
                            <span>
                                Mesas livres
                            </span>

                            <strong>
                                {Math.max(
                                    mesasAtivas.length -
                                        mesasOcupadas,
                                    0
                                )}
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
                                {totalEmAberto.toLocaleString(
                                    'pt-BR',
                                    {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }
                                )}
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
                                                    Mesa{' '}
                                                    {venda.mesa}
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
                                                        venda.total ||
                                                            0
                                                    ).toLocaleString(
                                                        'pt-BR',
                                                        {
                                                            style:
                                                                'currency',
                                                            currency:
                                                                'BRL'
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
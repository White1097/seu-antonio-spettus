import { useMemo } from 'react';
import {
    Activity,
    Banknote,
    Clock3,
    CreditCard,
    Flame,
    ReceiptText,
    RefreshCw,
    ShoppingBasket,
    TrendingUp,
    UsersRound,
    UtensilsCrossed
} from 'lucide-react';

import Layout from '../../components/Layout/Layout';
import useRelatorios from '../../hooks/useRelatorios';
import { useMetaDiaria } from '../../hooks/useMetaDiaria';
import './PainelExecutivo.css';

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function numero(valor) {
    return Number(valor || 0).toLocaleString('pt-BR');
}

function obterDataVenda(venda) {
    const valor = venda.criado_em || venda.created_at || venda.data_venda || venda.data;
    const data = valor ? new Date(valor) : null;
    return data && !Number.isNaN(data.getTime()) ? data : null;
}

function totalComanda(comanda) {
    return (comanda?.itens || []).reduce(
        (soma, item) => soma + Number(item.preco || item.preco_unitario || 0) * Number(item.quantidade || 0),
        0
    );
}

function quantidadeComanda(comanda) {
    return (comanda?.itens || []).reduce(
        (soma, item) => soma + Number(item.quantidade || 0),
        0
    );
}

function CardKpi({ icone: Icone, rotulo, valor, detalhe }) {
    return (
        <article className="executivo-kpi">
            <div className="executivo-kpi-icone"><Icone size={22} /></div>
            <div>
                <span>{rotulo}</span>
                <strong>{valor}</strong>
                <small>{detalhe}</small>
            </div>
        </article>
    );
}

function PainelExecutivo({ comandas = {}, mudarPaginaSistema }) {
    const { metaDiaria } = useMetaDiaria();

    const {
        relatorio,
        comparativo,
        carregando,
        erro,
        filtro,
        atualizarFiltro,
        carregarRelatorio
    } = useRelatorios();

    const comandasAbertas = useMemo(
        () => Object.entries(comandas)
            .map(([mesa, comanda]) => ({
                mesa: Number(mesa),
                cliente: comanda?.cliente || 'Sem cliente informado',
                itens: quantidadeComanda(comanda),
                total: totalComanda(comanda),
                atualizadoEm: comanda?.atualizado_em || comanda?.updated_at || null
            }))
            .filter(item => item.itens > 0)
            .sort((a, b) => b.total - a.total),
        [comandas]
    );

    const totalEmAberto = useMemo(
        () => comandasAbertas.reduce((soma, item) => soma + item.total, 0),
        [comandasAbertas]
    );

    const faturamentoHora = useMemo(() => {
        const mapa = Array.from({ length: 24 }, (_, hora) => ({ hora, valor: 0, vendas: 0 }));
        relatorio.vendas.forEach(venda => {
            const data = obterDataVenda(venda);
            if (!data) return;
            const item = mapa[data.getHours()];
            item.valor += Number(venda.total || venda.valor_total || 0);
            item.vendas += 1;
        });
        return mapa.filter(item => item.valor > 0 || item.vendas > 0);
    }, [relatorio.vendas]);

    const maiorHora = Math.max(1, ...faturamentoHora.map(item => item.valor));
    const maiorDia = Math.max(1, ...relatorio.faturamentoPorDia.map(item => Number(item.valor || 0)));
    const melhorProduto = relatorio.produtos[0];
    const melhorFuncionario = relatorio.funcionarios[0];
    const formaPrincipal = relatorio.formasPagamento[0];

    const faturamentoAnterior = Number(comparativo?.resumo?.faturamentoTotal || 0);
    const faturamentoAtual = Number(relatorio.resumo.faturamentoTotal || 0);
    const crescimento = faturamentoAnterior > 0
        ? ((faturamentoAtual - faturamentoAnterior) / faturamentoAnterior) * 100
        : (faturamentoAtual > 0 ? 100 : 0);
    const meta = metaDiaria;
    const progressoMeta = meta > 0 ? Math.min(100, (faturamentoAtual / meta) * 100) : 0;

    const filtros = [
        ['hoje', 'Hoje'],
        ['ontem', 'Ontem'],
        ['semana', 'Semana'],
        ['mes', 'Mês'],
        ['ultimos30', '30 dias']
    ];

    return (
        <Layout paginaAtual="executivo" mudarPagina={mudarPaginaSistema} titulo="Painel Executivo">
            <section className="painel-executivo">
                <header className="executivo-cabecalho">
                    <div>
                        <span className="executivo-selo"><Activity size={15} /> Gestão em tempo real</span>
                        <h2>Painel Executivo</h2>
                        <p>Indicadores de vendas, atendimento e desempenho em uma única tela.</p>
                    </div>
                    <button className="executivo-atualizar" type="button" onClick={carregarRelatorio} disabled={carregando}>
                        <RefreshCw size={18} className={carregando ? 'girando' : ''} />
                        Atualizar
                    </button>
                </header>

                <div className="executivo-filtros" role="group" aria-label="Período do painel">
                    {filtros.map(([id, label]) => (
                        <button key={id} type="button" className={filtro === id ? 'ativo' : ''} onClick={() => atualizarFiltro(id)}>
                            {label}
                        </button>
                    ))}
                </div>

                {erro && <div className="executivo-erro">{erro}</div>}

                <section className="executivo-comparativo">
                    <div>
                        <span>Comparação com período anterior</span>
                        <strong className={crescimento >= 0 ? 'positivo' : 'negativo'}>
                            {crescimento >= 0 ? '▲' : '▼'} {Math.abs(crescimento).toFixed(1)}%
                        </strong>
                        <small>{dinheiro(faturamentoAnterior)} no período anterior</small>
                    </div>
                    <div>
                        <span>Meta do período</span>
                        <strong>{dinheiro(meta)}</strong>
                        <div className="executivo-meta-trilho"><i style={{ width: `${progressoMeta}%` }} /></div>
                        <small>{progressoMeta.toFixed(0)}% alcançado</small>
                    </div>
                </section>

                <div className="executivo-kpis">
                    <CardKpi icone={Banknote} rotulo="Faturamento" valor={dinheiro(relatorio.resumo.faturamentoTotal)} detalhe={`${numero(relatorio.resumo.quantidadeVendas)} contas fechadas`} />
                    <CardKpi icone={ReceiptText} rotulo="Ticket médio" valor={dinheiro(relatorio.resumo.ticketMedio)} detalhe="Média por venda" />
                    <CardKpi icone={UtensilsCrossed} rotulo="Mesas ocupadas" valor={numero(comandasAbertas.length)} detalhe={`${dinheiro(totalEmAberto)} em aberto`} />
                    <CardKpi icone={ShoppingBasket} rotulo="Itens vendidos" valor={numero(relatorio.resumo.quantidadeProdutos)} detalhe={`${numero(relatorio.resumo.mesasAtendidas)} mesas atendidas`} />
                </div>

                <div className="executivo-grade-principal">
                    <article className="executivo-painel executivo-evolucao">
                        <div className="executivo-titulo">
                            <div><TrendingUp size={20} /><div><span>Desempenho</span><h3>Faturamento por dia</h3></div></div>
                        </div>
                        <div className="executivo-barras">
                            {relatorio.faturamentoPorDia.length === 0 ? (
                                <p className="executivo-vazio">Nenhuma venda encontrada no período.</p>
                            ) : relatorio.faturamentoPorDia.map(item => (
                                <div className="executivo-barra-linha" key={item.data}>
                                    <span>{item.dataFormatada}</span>
                                    <div className="executivo-barra-trilho"><i style={{ width: `${Math.max(3, (Number(item.valor || 0) / maiorDia) * 100)}%` }} /></div>
                                    <strong>{dinheiro(item.valor)}</strong>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="executivo-painel">
                        <div className="executivo-titulo">
                            <div><Clock3 size={20} /><div><span>Movimento</span><h3>Faturamento por hora</h3></div></div>
                        </div>
                        <div className="executivo-barras executivo-barras-hora">
                            {faturamentoHora.length === 0 ? (
                                <p className="executivo-vazio">Ainda não há horários registrados.</p>
                            ) : faturamentoHora.map(item => (
                                <div className="executivo-barra-linha" key={item.hora}>
                                    <span>{String(item.hora).padStart(2, '0')}h</span>
                                    <div className="executivo-barra-trilho"><i style={{ width: `${Math.max(3, (item.valor / maiorHora) * 100)}%` }} /></div>
                                    <strong>{dinheiro(item.valor)}</strong>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>

                <div className="executivo-destaques">
                    <article><Flame size={22} /><span>Produto líder</span><strong>{melhorProduto?.nome || 'Sem dados'}</strong><small>{melhorProduto ? `${numero(melhorProduto.quantidade)} unidades` : 'Aguardando vendas'}</small></article>
                    <article><UsersRound size={22} /><span>Funcionário destaque</span><strong>{melhorFuncionario?.nome || 'Sem dados'}</strong><small>{melhorFuncionario ? dinheiro(melhorFuncionario.valor) : 'Aguardando vendas'}</small></article>
                    <article><CreditCard size={22} /><span>Pagamento principal</span><strong>{formaPrincipal?.nome || 'Sem dados'}</strong><small>{formaPrincipal ? `${Number(formaPrincipal.percentual || 0).toFixed(1)}% do faturamento` : 'Aguardando vendas'}</small></article>
                </div>

                <div className="executivo-grade-inferior">
                    <article className="executivo-painel">
                        <div className="executivo-titulo"><div><UtensilsCrossed size={20} /><div><span>Agora</span><h3>Comandas em aberto</h3></div></div></div>
                        <div className="executivo-tabela-wrap">
                            <table className="executivo-tabela">
                                <thead><tr><th>Mesa</th><th>Cliente</th><th>Itens</th><th>Total</th></tr></thead>
                                <tbody>
                                    {comandasAbertas.length === 0 ? <tr><td colSpan="4" className="executivo-vazio">Nenhuma comanda aberta.</td></tr> : comandasAbertas.slice(0, 8).map(item => (
                                        <tr key={item.mesa}><td><b>Mesa {item.mesa}</b></td><td>{item.cliente}</td><td>{item.itens}</td><td><strong>{dinheiro(item.total)}</strong></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="executivo-painel">
                        <div className="executivo-titulo"><div><Flame size={20} /><div><span>Ranking</span><h3>Produtos mais vendidos</h3></div></div></div>
                        <ol className="executivo-ranking">
                            {relatorio.produtos.length === 0 ? <li className="executivo-vazio">Nenhum produto vendido.</li> : relatorio.produtos.slice(0, 6).map((produto, indice) => (
                                <li key={`${produto.nome}-${indice}`}><span>{indice + 1}</span><div><strong>{produto.nome}</strong><small>{numero(produto.quantidade)} unidades</small></div><b>{dinheiro(produto.valor)}</b></li>
                            ))}
                        </ol>
                    </article>
                </div>
            </section>
        </Layout>
    );
}

export default PainelExecutivo;

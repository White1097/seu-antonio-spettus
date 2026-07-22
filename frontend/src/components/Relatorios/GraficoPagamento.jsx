function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatarPercentual(valor) {
    return `${Number(valor || 0).toFixed(1).replace('.', ',')}%`;
}

export default function GraficoPagamento({
    dados = []
}) {
    const maiorValor = Math.max(
        ...dados.map(item => Number(item.valor || 0)),
        1
    );

    return (
        <section className="grafico-card">
            <div className="grafico-cabecalho">
                <span>
                    Formas de pagamento
                </span>

                <h3>
                    Distribuição das vendas
                </h3>
            </div>

            {dados.length === 0 ? (
                <div className="grafico-vazio">
                    Nenhuma forma de pagamento encontrada.
                </div>
            ) : (
                <div className="grafico-pagamento-lista">
                    {dados.map(item => {
                        const largura = Math.max(
                            (
                                Number(item.valor || 0) /
                                maiorValor
                            ) * 100,
                            4
                        );

                        return (
                            <article
                                key={item.nome}
                                className="grafico-pagamento-item"
                            >
                                <div className="grafico-pagamento-topo">
                                    <div>
                                        <strong>
                                            {item.nome}
                                        </strong>

                                        <span>
                                            {item.quantidade}{' '}
                                            {item.quantidade === 1
                                                ? 'venda'
                                                : 'vendas'}
                                        </span>
                                    </div>

                                    <div className="grafico-pagamento-valores">
                                        <strong>
                                            {formatarMoeda(
                                                item.valor
                                            )}
                                        </strong>

                                        <span>
                                            {formatarPercentual(
                                                item.percentual
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="grafico-pagamento-trilha">
                                    <div
                                        className="grafico-pagamento-preenchimento"
                                        style={{
                                            width: `${largura}%`
                                        }}
                                    />
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
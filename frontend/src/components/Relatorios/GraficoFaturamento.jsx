function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export default function GraficoFaturamento({
    dados = []
}) {
    const maiorValor = Math.max(
        ...dados.map(item => Number(item.valor || 0)),
        1
    );

    return (
        <section className="grafico-card">
            <div className="grafico-cabecalho">
                <span>Faturamento</span>

                <h3>Evolução por dia</h3>
            </div>

            {dados.length === 0 ? (
                <div className="grafico-vazio">
                    Nenhum dado encontrado.
                </div>
            ) : (
                <>
                    <div className="grafico-barras">
                        {dados.map(item => {
                            const altura = Math.max(
                                (Number(item.valor || 0) / maiorValor) * 100,
                                4
                            );

                            return (
                                <div
                                    key={item.data}
                                    className="grafico-barra-item"
                                >
                                    <div
                                        className="grafico-barra"
                                        style={{
                                            height: `${altura}%`
                                        }}
                                        title={formatarMoeda(item.valor)}
                                    />

                                    <span className="grafico-label">
                                        {item.dataFormatada}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grafico-resumo">
                        {dados.map(item => (
                            <div
                                key={item.data}
                                className="grafico-resumo-item"
                            >
                                <span>
                                    {item.dataFormatada}
                                </span>

                                <strong>
                                    {formatarMoeda(item.valor)}
                                </strong>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
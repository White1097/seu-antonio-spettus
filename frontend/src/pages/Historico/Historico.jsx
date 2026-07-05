function Historico({ vendas, limparHistorico, voltarDashboard }) {
    const totalVendido = vendas.reduce((soma, venda) => {
        return soma + Number(venda.total);
    }, 0);

    const produtosVendidos = {};

    vendas.forEach(venda => {
        venda.itens.forEach(item => {
            if (!produtosVendidos[item.nome]) {
                produtosVendidos[item.nome] = 0;
            }

            produtosVendidos[item.nome] += Number(item.quantidade);
        });
    });

    const produtoMaisVendido = Object.entries(produtosVendidos)
        .sort((a, b) => b[1] - a[1])[0];

    return (
        <div style={{ padding: '30px', background: '#F5F1E8', minHeight: '100vh' }}>
            <button
                onClick={voltarDashboard}
                style={{
                    background: '#C89B3C',
                    color: '#2D1F39',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                ← Voltar
            </button>

            <h1 style={{ color: '#4A315C', marginBottom: '10px' }}>
                Histórico de Vendas
            </h1>

            <h2 style={{ color: '#2D1F39', marginBottom: '10px' }}>
                Total vendido: R$ {totalVendido.toFixed(2)}
            </h2>

            <h3 style={{ color: '#4A315C', marginBottom: '20px' }}>
                Produto mais vendido: {produtoMaisVendido
                    ? `${produtoMaisVendido[0]} (${produtoMaisVendido[1]} unidades)`
                    : 'Nenhum produto vendido ainda'}
            </h3>

            <button
                onClick={limparHistorico}
                style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                Limpar histórico
            </button>

            {vendas.length === 0 ? (
                <p>Nenhuma venda fechada ainda.</p>
            ) : (
                vendas.map(venda => (
                    <div
                        key={venda.id}
                        style={{
                            background: 'white',
                            borderLeft: '5px solid #C89B3C',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '15px'
                        }}
                    >
                        <h2 style={{ color: '#4A315C' }}>
                            Mesa {venda.mesa}
                            {venda.cliente ? ` - ${venda.cliente}` : ''}
                        </h2>

                        <p><strong>Data:</strong> {venda.data}</p>
                        <p><strong>Pagamento:</strong> {venda.pagamento}</p>
                        <p><strong>Subtotal:</strong> R$ {Number(venda.subtotal).toFixed(2)}</p>
                        <p><strong>Desconto:</strong> R$ {Number(venda.desconto).toFixed(2)}</p>
                        <p><strong>Acréscimo:</strong> R$ {Number(venda.acrescimo).toFixed(2)}</p>
                        <p><strong>Total:</strong> R$ {Number(venda.total).toFixed(2)}</p>

                        <br />

                        <strong>Itens:</strong>

                        {venda.itens.map((item, index) => (
                            <div key={index} style={{ marginTop: '8px' }}>
                                <p>
                                    {item.quantidade}x {item.nome} - R$ {(Number(item.preco) * Number(item.quantidade)).toFixed(2)}
                                </p>

                                {item.observacao && (
                                    <small>
                                        Observação: {item.observacao}
                                    </small>
                                )}
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}

export default Historico;
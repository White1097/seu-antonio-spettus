import './Dashboard.css';

function Dashboard({
    comandas,
    vendas,
    abrirComanda,
    abrirHistorico,
    abrirProdutos
}) {
    const mesas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    function itensMesa(numero) {
        return comandas[numero]?.itens || [];
    }

    function totalMesa(numero) {
        return itensMesa(numero).reduce((soma, item) => {
            return (
                soma +
                Number(item.preco) * Number(item.quantidade)
            );
        }, 0);
    }

    const mesasOcupadas = mesas.filter(numero => {
        return itensMesa(numero).length > 0;
    }).length;

    const mesasLivres = mesas.length - mesasOcupadas;

    const totalAberto = mesas.reduce((soma, numero) => {
        return soma + totalMesa(numero);
    }, 0);

    const totalVendido = vendas.reduce((soma, venda) => {
        return soma + Number(venda.total);
    }, 0);

    return (
        <div className="dashboard">

            <div className="titulo">
                <h1>🍢 Seu Antônio Spettus</h1>
                <p>Sistema de Comandas Digitais</p>
                <p>Total de mesas: 10</p>

                <button
                    className="botao-historico"
                    onClick={abrirHistorico}
                >
                    Ver histórico de vendas
                </button>

                <button
                    className="botao-historico"
                    onClick={abrirProdutos}
                >
                    Gerenciar produtos
                </button>
            </div>

            <div className="resumo">

                <div>
                    <h3>Mesas livres</h3>
                    <strong>{mesasLivres}</strong>
                </div>

                <div>
                    <h3>Mesas ocupadas</h3>
                    <strong>{mesasOcupadas}</strong>
                </div>

                <div>
                    <h3>Total em aberto</h3>
                    <strong>
                        R$ {totalAberto.toFixed(2)}
                    </strong>
                </div>

                <div>
                    <h3>Total vendido</h3>
                    <strong>
                        R$ {totalVendido.toFixed(2)}
                    </strong>
                </div>

            </div>

            <div className="mesas">

                {mesas.map(numero => {
                    const comanda = comandas[numero];
                    const ocupada = itensMesa(numero).length > 0;
                    const cliente = comanda?.cliente || '';

                    return (
                        <div
                            key={numero}
                            className="mesa"
                            onClick={() => abrirComanda(numero)}
                        >
                            <h2>Mesa {numero}</h2>

                            {cliente && (
                                <small className="nome-cliente-mesa">
                                    {cliente}
                                </small>
                            )}

                            <p
                                className={
                                    ocupada ? 'ocupada' : 'livre'
                                }
                            >
                                {ocupada ? 'Ocupada' : 'Livre'}
                            </p>

                            <strong>
                                R$ {totalMesa(numero).toFixed(2)}
                            </strong>
                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default Dashboard;
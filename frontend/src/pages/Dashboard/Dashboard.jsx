import './Dashboard.css';

function Dashboard({ comandas, vendas, abrirComanda, abrirHistorico, abrirProdutos }) {
    const mesas = [1,2,3,4,5,6,7,8,9,10];

    function totalMesa(numero) {
        return comandas[numero].reduce((soma, item) => {
            return soma + item.preco * item.quantidade;
        }, 0);
    }

    const mesasOcupadas = mesas.filter(numero => comandas[numero].length > 0).length;
    const mesasLivres = mesas.length - mesasOcupadas;

    const totalAberto = mesas.reduce((soma, numero) => {
        return soma + totalMesa(numero);
    }, 0);

    const totalVendido = vendas.reduce((soma, venda) => {
        return soma + venda.total;
    }, 0);

    return (
        <div className="dashboard">
            <div className="titulo">
                <h1>🍢 Seu Antônio Spettus</h1>
                <p>Sistema de Comandas Digitais</p>
                <p>Total de mesas: 10</p>

                <button className="botao-historico" onClick={abrirHistorico}>
                    Ver histórico de vendas
                </button>
                <button className="botao-historico" onClick={abrirProdutos}>
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
                    <strong>R$ {totalAberto.toFixed(2)}</strong>
                </div>

                <div>
                    <h3>Total vendido</h3>
                    <strong>R$ {totalVendido.toFixed(2)}</strong>
                </div>
            </div>

            <div className="mesas">
                {mesas.map(numero => (
                    <div
                        key={numero}
                        className="mesa"
                        onClick={() => abrirComanda(numero)}
                    >
                        <h2>Mesa {numero}</h2>

                        <p className={comandas[numero].length > 0 ? 'ocupada' : 'livre'}>
                            {comandas[numero].length > 0 ? 'Ocupada' : 'Livre'}
                        </p>

                        <strong>R$ {totalMesa(numero).toFixed(2)}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
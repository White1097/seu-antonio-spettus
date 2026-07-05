import { useState } from 'react';
import './Comanda.css';

function Comanda({
    numeroMesa,
    itens,
    produtos,
    atualizarComanda,
    fecharConta,
    voltarDashboard
}) {
    const [fechandoConta, setFechandoConta] = useState(false);
    const [busca, setBusca] = useState('');
    const [cliente, setCliente] = useState('');
    const [desconto, setDesconto] = useState(0);
    const [acrescimo, setAcrescimo] = useState(0);

    function adicionarItem(produto) {
        const itemExistente = itens.find(item => item.id === produto.id);

        if (itemExistente) {
            atualizarComanda(
                numeroMesa,
                itens.map(item =>
                    item.id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                )
            );
        } else {
            atualizarComanda(numeroMesa, [
                ...itens,
                {
                    id: produto.id,
                    nome: produto.nome,
                    preco: Number(produto.preco),
                    quantidade: 1,
                    observacao: ''
                }
            ]);
        }
    }

    function diminuirItem(id) {
        atualizarComanda(
            numeroMesa,
            itens
                .map(item =>
                    item.id === id
                        ? { ...item, quantidade: item.quantidade - 1 }
                        : item
                )
                .filter(item => item.quantidade > 0)
        );
    }

    function alterarObservacao(id, observacao) {
        atualizarComanda(
            numeroMesa,
            itens.map(item =>
                item.id === id
                    ? { ...item, observacao }
                    : item
            )
        );
    }

    function aplicarPorcentagem(porcentagem) {
        const valor = subtotal * porcentagem;

        setAcrescimo(valor.toFixed(2));
    }

    const subtotal = itens.reduce((soma, item) => {
        return soma + Number(item.preco) * item.quantidade;
    }, 0);

    const total = Math.max(
        subtotal - Number(desconto || 0) + Number(acrescimo || 0),
        0
    );

    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(busca.toLowerCase())
    );

    const categorias = [
        ...new Set(produtosFiltrados.map(produto => produto.categoria))
    ];

    return (
        <div className="comanda">
            <div className="comanda-topo">
                <button className="botao-voltar" onClick={voltarDashboard}>
                    ← Voltar
                </button>

                <h1>Comanda - Mesa {numeroMesa}</h1>

                <input
                    className="input-cliente"
                    type="text"
                    placeholder="Nome do cliente (opcional)"
                    value={cliente}
                    onChange={evento => setCliente(evento.target.value)}
                />
            </div>

            <div className="area-comanda">
                <div className="lista-produtos">
                    <input
                        className="busca-produtos"
                        type="text"
                        placeholder="Buscar produto..."
                        value={busca}
                        onChange={evento => setBusca(evento.target.value)}
                    />

                    {categorias.map(categoria => (
                        <div key={categoria}>
                            <h2>{categoria}</h2>

                            <div className="produtos">
                                {produtosFiltrados
                                    .filter(produto => produto.categoria === categoria)
                                    .map(produto => (
                                        <button
                                            key={produto.id}
                                            onClick={() => adicionarItem(produto)}
                                        >
                                            {produto.nome} - R$ {Number(produto.preco).toFixed(2)}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="comanda-card">
                    <h2>Pedido</h2>

                    {itens.length === 0 ? (
                        <p>Nenhum item adicionado.</p>
                    ) : (
                        itens.map((item, index) => (
                            <div className="item-pedido" key={index}>
                                <div className="info-item">
                                    <span>
                                        {item.quantidade}x {item.nome} - R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                                    </span>

                                    <input
                                        className="observacao-item"
                                        type="text"
                                        placeholder="Observação..."
                                        value={item.observacao}
                                        onChange={evento =>
                                            alterarObservacao(item.id, evento.target.value)
                                        }
                                    />
                                </div>

                                <div className="acoes-item">
                                    <button onClick={() => diminuirItem(item.id)}>
                                        −
                                    </button>

                                    <button onClick={() => adicionarItem(item)}>
                                        +
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    <div className="ajustes-conta">
                        <label>
                            Desconto R$
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={desconto}
                                onChange={evento => setDesconto(evento.target.value)}
                            />
                        </label>

                        <label>
                            Acréscimo R$
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={acrescimo}
                                onChange={evento => setAcrescimo(evento.target.value)}
                            />
                        </label>
                    </div>

                    <div className="botoes-porcentagem">
                        <button onClick={() => aplicarPorcentagem(0.10)}>
                            +10%
                        </button>

                        <button onClick={() => aplicarPorcentagem(0.20)}>
                            +20%
                        </button>

                        <button onClick={() => setAcrescimo(0)}>
                            Remover %
                        </button>
                    </div>

                    <div className="total-comanda">
                        <p>Subtotal: R$ {subtotal.toFixed(2)}</p>
                        <p>Desconto: R$ {Number(desconto || 0).toFixed(2)}</p>
                        <p>Acréscimo: R$ {Number(acrescimo || 0).toFixed(2)}</p>
                        <h2>Total: R$ {total.toFixed(2)}</h2>
                    </div>

                    {!fechandoConta ? (
                        <button
                            className="botao-fechar"
                            disabled={itens.length === 0}
                            onClick={() => setFechandoConta(true)}
                        >
                            Fechar conta
                        </button>
                    ) : (
                        <div className="pagamento">
                            <h2>Forma de pagamento</h2>

                            {['PIX', 'Dinheiro', 'Cartão'].map(forma => (
                                <button
                                    key={forma}
                                    onClick={() =>
                                        fecharConta(numeroMesa, forma, {
                                            cliente,
                                            subtotal,
                                            desconto: Number(desconto || 0),
                                            acrescimo: Number(acrescimo || 0),
                                            total
                                        })
                                    }
                                >
                                    {forma}
                                </button>
                            ))}

                            <button
                                className="botao-cancelar"
                                onClick={() => setFechandoConta(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Comanda;
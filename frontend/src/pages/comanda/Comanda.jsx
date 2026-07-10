import { useState } from 'react';
import './Comanda.css';

function Comanda({
    numeroMesa,
    comanda,
    produtos,
    atualizarComanda,
    fecharConta,
    voltarDashboard
}) {
    const [fechandoConta, setFechandoConta] = useState(false);
    const [busca, setBusca] = useState('');

    const itens = comanda?.itens || [];
    const cliente = comanda?.cliente || '';
    const desconto = Number(comanda?.desconto || 0);
    const acrescimo = Number(comanda?.acrescimo || 0);

    function adicionarItem(produto) {
        const itemExistente = itens.find(
            item => Number(item.id) === Number(produto.id)
        );

        let novosItens;

        if (itemExistente) {
            novosItens = itens.map(item =>
                Number(item.id) === Number(produto.id)
                    ? {
                        ...item,
                        quantidade: Number(item.quantidade) + 1
                    }
                    : item
            );
        } else {
            novosItens = [
                ...itens,
                {
                    id: Number(produto.id),
                    nome: produto.nome,
                    preco: Number(produto.preco),
                    quantidade: 1,
                    observacao: ''
                }
            ];
        }

        atualizarComanda(numeroMesa, {
            itens: novosItens
        });
    }

    function diminuirItem(id) {
        const novosItens = itens
            .map(item =>
                Number(item.id) === Number(id)
                    ? {
                        ...item,
                        quantidade: Number(item.quantidade) - 1
                    }
                    : item
            )
            .filter(item => Number(item.quantidade) > 0);

        atualizarComanda(numeroMesa, {
            itens: novosItens
        });
    }

    function alterarObservacao(id, observacao) {
        const novosItens = itens.map(item =>
            Number(item.id) === Number(id)
                ? {
                    ...item,
                    observacao
                }
                : item
        );

        atualizarComanda(numeroMesa, {
            itens: novosItens
        });
    }

    const subtotal = itens.reduce((soma, item) => {
        return (
            soma +
            Number(item.preco) * Number(item.quantidade)
        );
    }, 0);

    const total = Math.max(
        subtotal - desconto + acrescimo,
        0
    );

    function aplicarAcrescimo10() {
        atualizarComanda(numeroMesa, {
            desconto: 0,
            acrescimo: Number((subtotal * 0.10).toFixed(2))
        });
    }

    function aplicarDesconto20() {
        atualizarComanda(numeroMesa, {
            desconto: Number((subtotal * 0.20).toFixed(2)),
            acrescimo: 0
        });
    }

    function removerPorcentagens() {
        atualizarComanda(numeroMesa, {
            desconto: 0,
            acrescimo: 0
        });
    }

    const produtosFiltrados = produtos.filter(produto =>
        produto.nome
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

    const categorias = [
        ...new Set(
            produtosFiltrados.map(produto => produto.categoria)
        )
    ];

    return (
        <div className="comanda">

            <div className="comanda-topo">

                <button
                    className="botao-voltar"
                    onClick={voltarDashboard}
                >
                    ← Voltar
                </button>

                <h1>Comanda - Mesa {numeroMesa}</h1>

                <input
                    className="input-cliente"
                    type="text"
                    placeholder="Nome do cliente (opcional)"
                    value={cliente}
                    onChange={evento =>
                        atualizarComanda(numeroMesa, {
                            cliente: evento.target.value
                        })
                    }
                />

            </div>

            <div className="area-comanda">

                <div className="lista-produtos">

                    <input
                        className="busca-produtos"
                        type="text"
                        placeholder="Buscar produto..."
                        value={busca}
                        onChange={evento =>
                            setBusca(evento.target.value)
                        }
                    />

                    {produtosFiltrados.length === 0 ? (
                        <p className="sem-produtos">
                            Nenhum produto encontrado.
                        </p>
                    ) : (
                        categorias.map(categoria => (
                            <div key={categoria}>

                                <h2>{categoria}</h2>

                                <div className="produtos">

                                    {produtosFiltrados
                                        .filter(
                                            produto =>
                                                produto.categoria === categoria
                                        )
                                        .map(produto => (
                                            <button
                                                key={produto.id}
                                                onClick={() =>
                                                    adicionarItem(produto)
                                                }
                                            >
                                                {produto.nome}
                                                {' - '}
                                                R$ {Number(
                                                    produto.preco
                                                ).toFixed(2)}
                                            </button>
                                        ))}

                                </div>

                            </div>
                        ))
                    )}

                </div>

                <div className="comanda-card">

                    <h2>Pedido</h2>

                    {itens.length === 0 ? (
                        <p>Nenhum item adicionado.</p>
                    ) : (
                        itens.map(item => (
                            <div
                                className="item-pedido"
                                key={item.id}
                            >
                                <div className="info-item">

                                    <span>
                                        {item.quantidade}x {item.nome}
                                        {' - '}
                                        R$ {(
                                            Number(item.preco) *
                                            Number(item.quantidade)
                                        ).toFixed(2)}
                                    </span>

                                    <input
                                        className="observacao-item"
                                        type="text"
                                        placeholder="Observação..."
                                        value={item.observacao || ''}
                                        onChange={evento =>
                                            alterarObservacao(
                                                item.id,
                                                evento.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="acoes-item">

                                    <button
                                        onClick={() =>
                                            diminuirItem(item.id)
                                        }
                                    >
                                        −
                                    </button>

                                    <button
                                        onClick={() =>
                                            adicionarItem(item)
                                        }
                                    >
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
                                onChange={evento =>
                                    atualizarComanda(numeroMesa, {
                                        desconto: Number(
                                            evento.target.value || 0
                                        )
                                    })
                                }
                            />
                        </label>

                        <label>
                            Acréscimo R$

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={acrescimo}
                                onChange={evento =>
                                    atualizarComanda(numeroMesa, {
                                        acrescimo: Number(
                                            evento.target.value || 0
                                        )
                                    })
                                }
                            />
                        </label>

                    </div>

                    <div className="botoes-porcentagem">

                        <button onClick={aplicarAcrescimo10}>
                            +10%
                        </button>

                        <button onClick={aplicarDesconto20}>
                            −20%
                        </button>

                        <button onClick={removerPorcentagens}>
                            Remover %
                        </button>

                    </div>

                    <div className="total-comanda">

                        <p>
                            Subtotal: R$ {subtotal.toFixed(2)}
                        </p>

                        <p>
                            Desconto: R$ {desconto.toFixed(2)}
                        </p>

                        <p>
                            Acréscimo: R$ {acrescimo.toFixed(2)}
                        </p>

                        <h2>
                            Total: R$ {total.toFixed(2)}
                        </h2>

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

                            {['PIX', 'Dinheiro', 'Cartão'].map(
                                forma => (
                                    <button
                                        key={forma}
                                        onClick={() =>
                                            fecharConta(
                                                numeroMesa,
                                                forma,
                                                {
                                                    subtotal,
                                                    desconto,
                                                    acrescimo,
                                                    total
                                                }
                                            )
                                        }
                                    >
                                        {forma}
                                    </button>
                                )
                            )}

                            <button
                                className="botao-cancelar"
                                onClick={() =>
                                    setFechandoConta(false)
                                }
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
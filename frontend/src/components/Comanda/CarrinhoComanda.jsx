import {
    Minus,
    Plus,
    Trash2
} from 'lucide-react';

function CarrinhoComanda({
    itens,
    adicionarItem,
    diminuirItem,
    removerItem,
    alterarObservacao
}) {
    if (itens.length === 0) {
        return (
            <section className="comanda2-carrinho">

                <h2>Pedido</h2>

                <div className="comanda2-carrinho-vazio">
                    Nenhum produto adicionado.
                </div>

            </section>
        );
    }

    return (
        <section className="comanda2-carrinho">

            <h2>Pedido</h2>

            <div className="comanda2-itens">

                {itens.map(item => (

                    <article
                        key={item.id}
                        className="comanda2-item"
                    >

                        <div className="comanda2-item-topo">

                            <div>

                                <strong>
                                    {item.nome}
                                </strong>

                                <span>
                                    {Number(item.preco).toLocaleString(
                                        'pt-BR',
                                        {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }
                                    )}
                                </span>

                            </div>

                            <div className="comanda2-quantidade">

                                <button
                                    type="button"
                                    onClick={(evento) => {
                                        evento.preventDefault();
                                        evento.stopPropagation();
                                        diminuirItem(item.id);
                                    }}
                                    aria-label={`Diminuir ${item.nome}`}
                                >
                                    <Minus size={15}/>
                                </button>

                                <strong>
                                    {item.quantidade}
                                </strong>

                                <button
                                    type="button"
                                    onClick={(evento) => {
                                        evento.preventDefault();
                                        evento.stopPropagation();
                                        adicionarItem(item);
                                    }}
                                    aria-label={`Aumentar ${item.nome}`}
                                >
                                    <Plus size={15}/>
                                </button>

                            </div>

                        </div>

                        <textarea
                            placeholder="Observação do item..."
                            value={item.observacao || ''}
                            onChange={(e)=>
                                alterarObservacao(
                                    item.id,
                                    e.target.value
                                )
                            }
                        />

                        <div className="comanda2-item-total">

                            <strong>

                                {(item.preco * item.quantidade)
                                    .toLocaleString(
                                        'pt-BR',
                                        {
                                            style:'currency',
                                            currency:'BRL'
                                        }
                                    )}

                            </strong>

                            <button
                                type="button"
                                className="comanda2-remover"
                                onClick={(evento) => {
                                    evento.preventDefault();
                                    evento.stopPropagation();
                                    removerItem(item.id);
                                }}
                                aria-label={`Remover ${item.nome} da comanda`}
                            >
                                <Trash2 size={16}/>
                            </button>

                        </div>

                    </article>

                ))}

            </div>

        </section>
    );
}

export default CarrinhoComanda;
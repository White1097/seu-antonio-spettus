import { Plus, Search } from 'lucide-react';

function ProdutosComanda({
    busca,
    setBusca,
    produtos,
    adicionarItem
}) {
    return (
        <section className="comanda2-produtos">

            <div className="comanda2-produtos-topo">

                <h2>Produtos</h2>

                <label className="comanda2-busca">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Pesquisar produto..."
                        value={busca}
                        onChange={(e) =>
                            setBusca(e.target.value)
                        }
                    />

                </label>

            </div>

            {produtos.length === 0 ? (

                <div className="comanda2-sem-produtos">
                    Nenhum produto encontrado.
                </div>

            ) : (

                <div className="comanda2-grid-produtos">

                    {produtos.map(produto => (

                        <button
                            key={produto.id}
                            type="button"
                            className="comanda2-produto"
                            onClick={() =>
                                adicionarItem(produto)
                            }
                        >

                            <div>

                                <strong>
                                    {produto.nome}
                                </strong>

                                <span>
                                    {produto.categoria}
                                </span>

                            </div>

                            <div className="comanda2-produto-rodape">

                                <strong>
                                    {Number(produto.preco).toLocaleString(
                                        'pt-BR',
                                        {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }
                                    )}
                                </strong>

                                <Plus size={18} />

                            </div>

                        </button>

                    ))}

                </div>

            )}

        </section>
    );
}

export default ProdutosComanda;
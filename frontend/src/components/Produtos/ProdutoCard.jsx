import {
    CheckCircle2,
    Pencil,
    Star,
    StarOff,
    Trash2,
    XCircle
} from 'lucide-react';

function ProdutoCard({
    produto,
    editarProduto,
    excluirProduto,
    alternarDisponibilidade,
    alternarDestaque
}) {
    return (
        <article className="produto-card">

            <div className="produto-card-imagem">

                {produto.imagem ? (

                    <img
                        src={produto.imagem}
                        alt={produto.nome}
                    />

                ) : (

                    <div className="produto-sem-imagem">
                        🍽️
                    </div>

                )}

            </div>

            <div className="produto-card-conteudo">

                <div className="produto-card-topo">

                    <div>

                        <span className="produto-categoria">
                            {produto.categoria}
                        </span>

                        <h3>
                            {produto.nome}
                        </h3>

                    </div>

                    <button
                        type="button"
                        className="produto-destaque"
                        onClick={() =>
                            alternarDestaque(produto)
                        }
                    >
                        {produto.destaque ? (
                            <Star
                                size={20}
                                fill="currentColor"
                            />
                        ) : (
                            <StarOff size={20} />
                        )}
                    </button>

                </div>

                <p className="produto-descricao">
                    {produto.descricao ||
                        'Sem descrição.'}
                </p>

                <div className="produto-preco">

                    {Number(
                        produto.preco || 0
                    ).toLocaleString(
                        'pt-BR',
                        {
                            style: 'currency',
                            currency: 'BRL'
                        }
                    )}

                </div>

                <div className="produto-status">

                    {produto.ativo ? (

                        <span className="status-ativo">

                            <CheckCircle2
                                size={16}
                            />

                            Disponível

                        </span>

                    ) : (

                        <span className="status-inativo">

                            <XCircle
                                size={16}
                            />

                            Indisponível

                        </span>

                    )}

                </div>

                <div className="produto-acoes">

                    <button
                        type="button"
                        onClick={() =>
                            editarProduto(produto)
                        }
                    >
                        <Pencil size={17} />

                        Editar
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            alternarDisponibilidade(
                                produto
                            )
                        }
                    >
                        {produto.ativo
                            ? 'Desativar'
                            : 'Ativar'}
                    </button>

                    <button
                        type="button"
                        className="produto-excluir"
                        onClick={() =>
                            excluirProduto(produto)
                        }
                    >
                        <Trash2 size={17} />

                        Excluir
                    </button>

                </div>

            </div>

        </article>
    );
}

export default ProdutoCard;
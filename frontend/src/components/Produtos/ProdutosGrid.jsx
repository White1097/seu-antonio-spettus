import ProdutoCard from './ProdutoCard';

function ProdutosGrid({
    produtos = [],
    carregando = false,
    editarProduto,
    excluirProduto,
    alternarDisponibilidade,
    alternarDestaque
}) {
    if (carregando) {
        return (
            <div className="produtos-grid-estado">
                Carregando produtos...
            </div>
        );
    }

    if (produtos.length === 0) {
        return (
            <div className="produtos-grid-estado">
                Nenhum produto encontrado.
            </div>
        );
    }

    return (
        <section className="produtos-grid">
            {produtos.map(produto => (
                <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    editarProduto={editarProduto}
                    excluirProduto={excluirProduto}
                    alternarDisponibilidade={
                        alternarDisponibilidade
                    }
                    alternarDestaque={
                        alternarDestaque
                    }
                />
            ))}
        </section>
    );
}

export default ProdutosGrid;
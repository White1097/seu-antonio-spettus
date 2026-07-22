function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export default function ProdutosMaisVendidos({
    produtos = []
}) {
    const produtosExibidos = produtos.slice(0, 10);

    return (
        <section className="relatorio-tabela-card">
            <div className="relatorios-secao-cabecalho">
                <div>
                    <span>
                        Produtos
                    </span>

                    <h3>
                        Mais vendidos
                    </h3>
                </div>

                <strong>
                    Top {produtosExibidos.length}
                </strong>
            </div>

            {produtosExibidos.length === 0 ? (
                <div className="relatorio-tabela-vazia">
                    Nenhum produto vendido no período.
                </div>
            ) : (
                <div className="relatorios-tabela-container">
                    <table className="relatorios-tabela">
                        <thead>
                            <tr>
                                <th>
                                    Posição
                                </th>

                                <th>
                                    Produto
                                </th>

                                <th className="relatorios-coluna-valor">
                                    Quantidade
                                </th>

                                <th className="relatorios-coluna-valor">
                                    Faturamento
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {produtosExibidos.map(
                                (produto, indice) => (
                                    <tr
                                        key={`${produto.nome}-${indice}`}
                                    >
                                        <td>
                                            <span className="relatorio-posicao">
                                                {indice + 1}º
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {produto.nome}
                                            </strong>
                                        </td>

                                        <td className="relatorios-coluna-valor">
                                            {Number(
                                                produto.quantidade || 0
                                            ).toLocaleString('pt-BR')}
                                        </td>

                                        <td className="relatorios-coluna-valor">
                                            {formatarMoeda(
                                                produto.valor
                                            )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
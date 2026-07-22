function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export default function FuncionariosRanking({
    funcionarios = []
}) {
    const funcionariosExibidos = funcionarios.slice(0, 10);

    return (
        <section className="relatorio-tabela-card">
            <div className="relatorios-secao-cabecalho">
                <div>
                    <span>
                        Equipe
                    </span>

                    <h3>
                        Ranking de Funcionários
                    </h3>
                </div>

                <strong>
                    Top {funcionariosExibidos.length}
                </strong>
            </div>

            {funcionariosExibidos.length === 0 ? (
                <div className="relatorio-tabela-vazia">
                    Nenhum funcionário encontrado.
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
                                    Funcionário
                                </th>

                                <th className="relatorios-coluna-valor">
                                    Vendas
                                </th>

                                <th className="relatorios-coluna-valor">
                                    Faturamento
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {funcionariosExibidos.map(
                                (funcionario, indice) => (
                                    <tr
                                        key={`${funcionario.nome}-${indice}`}
                                    >
                                        <td>
                                            <span className="relatorio-posicao">
                                                {indice + 1}º
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {funcionario.nome}
                                            </strong>
                                        </td>

                                        <td className="relatorios-coluna-valor">
                                            {Number(
                                                funcionario.quantidadeVendas || 0
                                            ).toLocaleString('pt-BR')}
                                        </td>

                                        <td className="relatorios-coluna-valor">
                                            {formatarMoeda(
                                                funcionario.valor
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
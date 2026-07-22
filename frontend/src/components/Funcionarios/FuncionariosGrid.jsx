import FuncionarioCard from './FuncionarioCard';

function FuncionariosGrid({
    funcionarios = [],
    carregando = false,
    editarFuncionario,
    excluirFuncionario,
    alternarStatus
}) {
    if (carregando) {
        return (
            <div className="funcionarios-grid-estado">
                Carregando funcionários...
            </div>
        );
    }

    if (funcionarios.length === 0) {
        return (
            <div className="funcionarios-grid-estado">
                Nenhum funcionário encontrado.
            </div>
        );
    }

    return (
        <section className="funcionarios-grid">
            {funcionarios.map(funcionario => (
                <FuncionarioCard
                    key={funcionario.id}
                    funcionario={funcionario}
                    editarFuncionario={editarFuncionario}
                    excluirFuncionario={excluirFuncionario}
                    alternarStatus={alternarStatus}
                />
            ))}
        </section>
    );
}

export default FuncionariosGrid;
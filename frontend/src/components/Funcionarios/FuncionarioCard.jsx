import {
    CheckCircle2,
    Mail,
    Pencil,
    Shield,
    Trash2,
    UserRound,
    XCircle
} from 'lucide-react';

function formatarCargo(cargo) {
    const valor = String(cargo || '')
        .trim()
        .toLowerCase();

    switch (valor) {
        case 'garcom':
            return 'Garçom';

        case 'caixa':
            return 'Caixa';

        case 'administrador':
            return 'Administrador';

        default:
            return cargo;
    }
}

function FuncionarioCard({
    funcionario,
    editarFuncionario,
    excluirFuncionario,
    alternarStatus
}) {
    const avatar =
        funcionario.avatar?.trim() || '';

    return (
        <article className="funcionario-card">

            <div className="funcionario-avatar">

                {avatar ? (
                    <img
                        src={avatar}
                        alt={funcionario.nome}
                    />
                ) : (
                    <div className="funcionario-avatar-placeholder">
                        <UserRound size={42} />
                    </div>
                )}

            </div>

            <div className="funcionario-conteudo">

                <div className="funcionario-topo">

                    <div>

                        <h3>
                            {funcionario.nome}
                        </h3>

                        <span className="funcionario-cargo">
                            <Shield size={15} />
                            {formatarCargo(funcionario.cargo)}
                        </span>

                    </div>

                </div>

                <div className="funcionario-email">

                    <Mail size={15} />

                    <span>
                        {funcionario.email}
                    </span>

                </div>

                <div className="funcionario-status">

                    {funcionario.ativo ? (

                        <span className="status-ativo">

                            <CheckCircle2 size={16} />

                            Ativo

                        </span>

                    ) : (

                        <span className="status-inativo">

                            <XCircle size={16} />

                            Inativo

                        </span>

                    )}

                </div>

                <div className="funcionario-acoes">

                    <button
                        onClick={() =>
                            editarFuncionario(funcionario)
                        }
                    >
                        <Pencil size={16} />
                        Editar
                    </button>

                    <button
                        onClick={() =>
                            alternarStatus(funcionario)
                        }
                    >
                        {funcionario.ativo
                            ? 'Desativar'
                            : 'Ativar'}
                    </button>

                    <button
                        className="funcionario-excluir"
                        onClick={() =>
                            excluirFuncionario(funcionario)
                        }
                    >
                        <Trash2 size={16} />
                        Excluir
                    </button>

                </div>

            </div>

        </article>
    );
}

export default FuncionarioCard;
import { X } from 'lucide-react';

import FuncionarioForm from './FuncionarioForm';

function FuncionarioModal({
    aberto,
    editando,
    formulario,
    setFormulario,
    salvando = false,
    erro = '',
    fecharModal,
    salvarFuncionario
}) {
    if (!aberto) {
        return null;
    }

    return (
        <div
            className="funcionario-modal-overlay"
            role="presentation"
            onMouseDown={evento => {
                if (
                    evento.target === evento.currentTarget &&
                    !salvando
                ) {
                    fecharModal();
                }
            }}
        >
            <section
                className="funcionario-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-funcionario-modal"
            >
                <header className="funcionario-modal-topo">
                    <div>
                        <span>
                            {editando
                                ? 'Editar cadastro'
                                : 'Novo cadastro'}
                        </span>

                        <h2 id="titulo-funcionario-modal">
                            {editando
                                ? 'Editar funcionário'
                                : 'Adicionar funcionário'}
                        </h2>

                        <p>
                            Defina os dados e o nível de acesso.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="funcionario-modal-fechar"
                        onClick={fecharModal}
                        disabled={salvando}
                        aria-label="Fechar"
                    >
                        <X size={21} />
                    </button>
                </header>

                <form onSubmit={salvarFuncionario}>
                    {erro && (
                        <div className="funcionario-modal-erro">
                            {erro}
                        </div>
                    )}

                    <FuncionarioForm
                        formulario={formulario}
                        setFormulario={setFormulario}
                        salvando={salvando}
                        editando={editando}
                    />

                    <footer className="funcionario-modal-rodape">
                        <button
                            type="button"
                            className="funcionario-modal-cancelar"
                            onClick={fecharModal}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="funcionario-modal-salvar"
                            disabled={salvando}
                        >
                            {salvando
                                ? 'Salvando...'
                                : editando
                                    ? 'Salvar alterações'
                                    : 'Adicionar funcionário'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default FuncionarioModal;    
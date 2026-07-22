import { X } from 'lucide-react';

import ProdutoForm from './ProdutoForm';

function ProdutoModal({
    aberto,
    editando,
    formulario,
    setFormulario,
    categorias = [],
    salvando = false,
    erro = '',
    fecharModal,
    salvarProduto
}) {
    if (!aberto) {
        return null;
    }

    return (
        <div
            className="produto-modal-overlay"
            role="presentation"
            onMouseDown={evento => {
                if (
                    evento.target ===
                    evento.currentTarget &&
                    !salvando
                ) {
                    fecharModal();
                }
            }}
        >
            <section
                className="produto-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-produto-modal"
            >
                <header className="produto-modal-topo">
                    <div>
                        <span>
                            {editando
                                ? 'Editar cadastro'
                                : 'Novo cadastro'}
                        </span>

                        <h2 id="titulo-produto-modal">
                            {editando
                                ? 'Editar produto'
                                : 'Adicionar produto'}
                        </h2>

                        <p>
                            Preencha os dados do produto.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="produto-modal-fechar"
                        onClick={fecharModal}
                        disabled={salvando}
                        aria-label="Fechar"
                    >
                        <X size={21} />
                    </button>
                </header>

                <form onSubmit={salvarProduto}>
                    {erro && (
                        <div className="produto-modal-erro">
                            {erro}
                        </div>
                    )}

                    <ProdutoForm
                        formulario={formulario}
                        setFormulario={setFormulario}
                        categorias={categorias}
                        salvando={salvando}
                    />

                    <footer className="produto-modal-rodape">
                        <button
                            type="button"
                            className="produto-modal-cancelar"
                            onClick={fecharModal}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="produto-modal-salvar"
                            disabled={salvando}
                        >
                            {salvando
                                ? 'Salvando...'
                                : editando
                                    ? 'Salvar alterações'
                                    : 'Adicionar produto'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default ProdutoModal;
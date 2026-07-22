import { X } from 'lucide-react';

import CaixaForm from './CaixaForm';

function tituloModal(tipo) {
    const titulos = {
        abrir: 'Abrir caixa',
        suprimento: 'Adicionar suprimento',
        sangria: 'Registrar sangria',
        fechar: 'Fechar caixa'
    };

    return titulos[tipo] || 'Movimentação do caixa';
}

function descricaoModal(tipo) {
    const descricoes = {
        abrir: 'Informe o valor inicial disponível no caixa.',
        suprimento: 'Registre uma entrada manual de dinheiro.',
        sangria: 'Registre uma retirada manual de dinheiro.',
        fechar: 'O sistema fechará o caixa usando o saldo calculado automaticamente.'
    };

    return descricoes[tipo] || '';
}

function textoBotao(tipo) {
    const textos = {
        abrir: 'Abrir caixa',
        suprimento: 'Adicionar suprimento',
        sangria: 'Registrar sangria',
        fechar: 'Fechar caixa'
    };

    return textos[tipo] || 'Confirmar';
}

function CaixaModal({
    aberto,
    tipo,
    formulario,
    setFormulario,
    salvando = false,
    erro = '',
    fecharModal,
    confirmar
}) {
    if (!aberto) {
        return null;
    }

    return (
        <div
            className="caixa-modal-overlay"
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
                className="caixa-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="caixa-modal-titulo"
            >
                <header className="caixa-modal-topo">
                    <div>
                        <span>
                            Caixa
                        </span>

                        <h2 id="caixa-modal-titulo">
                            {tituloModal(tipo)}
                        </h2>

                        <p>
                            {descricaoModal(tipo)}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="caixa-modal-fechar"
                        onClick={fecharModal}
                        disabled={salvando}
                        aria-label="Fechar"
                    >
                        <X size={21} />
                    </button>
                </header>

                <form onSubmit={confirmar}>
                    {erro && (
                        <div className="caixa-modal-erro">
                            {erro}
                        </div>
                    )}

                    <CaixaForm
                        tipo={tipo}
                        formulario={formulario}
                        setFormulario={setFormulario}
                        salvando={salvando}
                    />

                    <footer className="caixa-modal-rodape">
                        <button
                            type="button"
                            className="caixa-modal-cancelar"
                            onClick={fecharModal}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="caixa-modal-confirmar"
                            disabled={salvando}
                        >
                            {salvando
                                ? 'Salvando...'
                                : textoBotao(tipo)}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default CaixaModal;
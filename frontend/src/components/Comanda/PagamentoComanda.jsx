import {
    Banknote,
    CreditCard,
    QrCode,
    X
} from 'lucide-react';

function PagamentoComanda({
    aberto,
    fecharModal,
    confirmarPagamento,
    processando = false
}) {
    if (!aberto) {
        return null;
    }

    const formasPagamento = [
        {
            id: 'PIX',
            nome: 'PIX',
            icone: QrCode
        },
        {
            id: 'Dinheiro',
            nome: 'Dinheiro',
            icone: Banknote
        },
        {
            id: 'Cartão',
            nome: 'Cartão',
            icone: CreditCard
        }
    ];

    return (
        <div
            className="comanda2-modal-overlay"
            role="presentation"
            onMouseDown={evento => {
                if (
                    evento.target ===
                    evento.currentTarget
                ) {
                    fecharModal();
                }
            }}
        >
            <section
                className="comanda2-modal-pagamento"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-pagamento"
            >
                <header className="comanda2-modal-topo">
                    <div>
                        <span>Fechamento</span>

                        <h2 id="titulo-pagamento">
                            Forma de pagamento
                        </h2>

                        <p>
                            Escolha como a conta foi paga.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="comanda2-modal-fechar"
                        onClick={fecharModal}
                        disabled={processando}
                        aria-label="Fechar"
                    >
                        <X size={21} />
                    </button>
                </header>

                <div className="comanda2-formas-pagamento">
                    {formasPagamento.map(forma => {
                        const Icone = forma.icone;

                        return (
                            <button
                                key={forma.id}
                                type="button"
                                onClick={() =>
                                    confirmarPagamento(
                                        forma.id
                                    )
                                }
                                disabled={processando}
                            >
                                <Icone size={24} />

                                <span>
                                    {forma.nome}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="comanda2-modal-cancelar"
                    onClick={fecharModal}
                    disabled={processando}
                >
                    Cancelar
                </button>
            </section>
        </div>
    );
}

export default PagamentoComanda;
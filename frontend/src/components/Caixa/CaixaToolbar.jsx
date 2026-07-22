import {
    ArrowDownCircle,
    ArrowUpCircle,
    LockKeyhole,
    WalletCards
} from 'lucide-react';

function CaixaToolbar({
    caixaAberto,
    abrirModal
}) {
    return (
        <section className="caixa-toolbar">
            <div className="caixa-toolbar-status">
                <div
                    className={
                        caixaAberto
                            ? 'caixa-status-indicador aberto'
                            : 'caixa-status-indicador fechado'
                    }
                >
                    <span />

                    {caixaAberto
                        ? 'Caixa aberto'
                        : 'Caixa fechado'}
                </div>

                {caixaAberto && (
                    <div className="caixa-toolbar-data">
                        <span>
                            Aberto em
                        </span>

                        <strong>
                            {new Date(
                                caixaAberto.aberto_em
                            ).toLocaleString(
                                'pt-BR'
                            )}
                        </strong>
                    </div>
                )}
            </div>

            <div className="caixa-toolbar-acoes">
                {!caixaAberto ? (
                    <button
                        type="button"
                        className="caixa-toolbar-abrir"
                        onClick={() =>
                            abrirModal('abrir')
                        }
                    >
                        <WalletCards size={19} />
                        Abrir caixa
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                abrirModal('suprimento')
                            }
                        >
                            <ArrowUpCircle size={19} />
                            Suprimento
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                abrirModal('sangria')
                            }
                        >
                            <ArrowDownCircle size={19} />
                            Sangria
                        </button>

                        <button
                            type="button"
                            className="caixa-toolbar-fechar"
                            onClick={() =>
                                abrirModal('fechar')
                            }
                        >
                            <LockKeyhole size={19} />
                            Fechar caixa
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}

export default CaixaToolbar;
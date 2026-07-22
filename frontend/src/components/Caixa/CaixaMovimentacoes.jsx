import {
    ArrowDownCircle,
    ArrowUpCircle,
    Banknote,
    CreditCard,
    QrCode,
    ReceiptText
} from 'lucide-react';

function formatarDinheiro(valor) {
    return Number(valor || 0).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );
}

function formatarData(data) {
    if (!data) {
        return '';
    }

    return new Date(data).toLocaleString(
        'pt-BR'
    );
}

function escolherIcone(movimentacao) {
    if (
        movimentacao.tipo === 'suprimento'
    ) {
        return ArrowUpCircle;
    }

    if (
        movimentacao.tipo === 'sangria'
    ) {
        return ArrowDownCircle;
    }

    if (
        movimentacao.forma_pagamento ===
        'PIX'
    ) {
        return QrCode;
    }

    if (
        movimentacao.forma_pagamento ===
        'Dinheiro'
    ) {
        return Banknote;
    }

    if (
        movimentacao.forma_pagamento ===
        'Cartão'
    ) {
        return CreditCard;
    }

    return ReceiptText;
}

function nomeTipo(movimentacao) {
    if (
        movimentacao.tipo === 'suprimento'
    ) {
        return 'Suprimento';
    }

    if (
        movimentacao.tipo === 'sangria'
    ) {
        return 'Sangria';
    }

    return movimentacao.forma_pagamento
        ? `Venda em ${movimentacao.forma_pagamento}`
        : 'Venda';
}

function CaixaMovimentacoes({
    movimentacoes = [],
    carregando = false
}) {
    if (carregando) {
        return (
            <div className="caixa-movimentacoes-estado">
                Carregando movimentações...
            </div>
        );
    }

    if (
        movimentacoes.length === 0
    ) {
        return (
            <div className="caixa-movimentacoes-estado">
                Nenhuma movimentação registrada.
            </div>
        );
    }

    return (
        <section className="caixa-movimentacoes">
            <header className="caixa-movimentacoes-topo">
                <div>
                    <span>
                        Movimentações
                    </span>

                    <h2>
                        Histórico do caixa
                    </h2>
                </div>

                <strong>
                    {movimentacoes.length}
                </strong>
            </header>

            <div className="caixa-movimentacoes-lista">
                {movimentacoes.map(
                    movimentacao => {
                        const Icone =
                            escolherIcone(
                                movimentacao
                            );

                        const negativa =
                            movimentacao.tipo ===
                            'sangria';

                        return (
                            <article
                                key={
                                    movimentacao.id
                                }
                                className={
                                    negativa
                                        ? 'caixa-movimentacao negativa'
                                        : 'caixa-movimentacao'
                                }
                            >
                                <div className="caixa-movimentacao-icone">
                                    <Icone
                                        size={20}
                                    />
                                </div>

                                <div className="caixa-movimentacao-conteudo">
                                    <div className="caixa-movimentacao-cabecalho">
                                        <div>
                                            <strong>
                                                {nomeTipo(
                                                    movimentacao
                                                )}
                                            </strong>

                                            <span>
                                                {formatarData(
                                                    movimentacao.criado_em
                                                )}
                                            </span>
                                        </div>

                                        <strong>
                                            {negativa
                                                ? '- '
                                                : '+ '}

                                            {formatarDinheiro(
                                                movimentacao.valor
                                            )}
                                        </strong>
                                    </div>

                                    {movimentacao.descricao && (
                                        <p>
                                            {
                                                movimentacao.descricao
                                            }
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    }
                )}
            </div>
        </section>
    );
}

export default CaixaMovimentacoes;
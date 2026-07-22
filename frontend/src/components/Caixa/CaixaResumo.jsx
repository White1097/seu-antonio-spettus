import {
    ArrowDownCircle,
    ArrowUpCircle,
    Banknote,
    CreditCard,
    Landmark,
    QrCode,
    WalletCards
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

function CaixaResumo({
    resumo
}) {
    const cards = [
        {
            id: 'saldo-inicial',
            titulo: 'Saldo inicial',
            valor: resumo.saldoInicial,
            icone: WalletCards
        },
        {
            id: 'vendas',
            titulo: 'Total em vendas',
            valor: resumo.vendas,
            icone: Landmark
        },
        {
            id: 'pix',
            titulo: 'PIX',
            valor: resumo.pix,
            icone: QrCode
        },
        {
            id: 'dinheiro',
            titulo: 'Dinheiro',
            valor: resumo.dinheiro,
            icone: Banknote
        },
        {
            id: 'cartao',
            titulo: 'Cartão',
            valor: resumo.cartao,
            icone: CreditCard
        },
        {
            id: 'suprimentos',
            titulo: 'Suprimentos',
            valor: resumo.suprimentos,
            icone: ArrowUpCircle
        },
        {
            id: 'sangrias',
            titulo: 'Sangrias',
            valor: resumo.sangrias,
            icone: ArrowDownCircle
        },
        {
            id: 'ticket-medio',
            titulo: 'Ticket médio',
            valor: resumo.ticketMedio,
            icone: WalletCards
        },
        {
            id: 'maior-venda',
            titulo: 'Maior venda',
            valor: resumo.maiorVenda,
            icone: ArrowUpCircle
        },
        {
            id: 'menor-venda',
            titulo: 'Menor venda',
            valor: resumo.menorVenda,
            icone: ArrowDownCircle
        },
        {
            id: 'resultado',
            titulo: resumo.resultado >= 0 ? 'Lucro do caixa' : 'Prejuízo do caixa',
            valor: resumo.resultado,
            icone: resumo.resultado >= 0 ? ArrowUpCircle : ArrowDownCircle,
            destaque: true
        },
        {
            id: 'saldo-calculado',
            titulo: 'Saldo calculado',
            valor: resumo.saldoCalculado,
            icone: WalletCards,
            destaque: true
        }
    ];

    return (
        <section className="caixa-resumo">
            {cards.map(card => {
                const Icone = card.icone;

                return (
                    <article
                        key={card.id}
                        className={
                            card.destaque
                                ? 'caixa-resumo-card destaque'
                                : 'caixa-resumo-card'
                        }
                    >
                        <div className="caixa-resumo-icone">
                            <Icone size={22} />
                        </div>

                        <div>
                            <span>
                                {card.titulo}
                            </span>

                            <strong>
                                {formatarDinheiro(
                                    card.valor
                                )}
                            </strong>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}

export default CaixaResumo;
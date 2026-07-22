import {
    Banknote,
    ClipboardList,
    Table2,
    Users
} from 'lucide-react';

import './DashboardCards.css';

function formatarDinheiro(valor) {
    return Number(valor || 0).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );
}

function DashboardCards({
    totalMesas = 8,
    mesasOcupadas = 0,
    faturamentoHoje = 0,
    contasFechadas = 0,
    totalFuncionarios = 0,
    metaDiaria = 0,
    mostrarFinanceiro = true,
    mostrarFuncionarios = false
}) {
    const mesasLivres =
        Number(totalMesas) -
        Number(mesasOcupadas);

    const cards = [
        {
            id: 'mesas',
            titulo: 'Mesas',
            valor: `${mesasOcupadas}/${totalMesas}`,
            descricao: `${mesasLivres} livres`,
            icone: Table2,
            classe: 'roxo',
            visivel: true
        },
        {
            id: 'faturamento',
            titulo: 'Faturamento hoje',
            valor: formatarDinheiro(
                faturamentoHoje
            ),
            descricao: Number(metaDiaria) > 0
                ? `${Math.min(100, (Number(faturamentoHoje) / Number(metaDiaria)) * 100).toFixed(0)}% da meta de ${formatarDinheiro(metaDiaria)}`
                : 'Total vendido hoje',
            icone: Banknote,
            classe: 'dourado',
            visivel: mostrarFinanceiro
        },
        {
            id: 'contas',
            titulo: 'Contas fechadas',
            valor: contasFechadas,
            descricao: 'Vendas concluídas hoje',
            icone: ClipboardList,
            classe: 'verde',
            visivel: mostrarFinanceiro
        },
        {
            id: 'funcionarios',
            titulo: 'Funcionários',
            valor: totalFuncionarios,
            descricao: 'Cadastros ativos',
            icone: Users,
            classe: 'laranja',
            visivel: mostrarFuncionarios
        }
    ];

    return (
        <section className="dashboard-cards">
            {cards
                .filter(card => card.visivel)
                .map(card => {
                    const Icone = card.icone;

                    return (
                        <article
                            key={card.id}
                            className="dashboard-card"
                        >
                            <div
                                className={
                                    `dashboard-card-icone ${card.classe}`
                                }
                            >
                                <Icone size={24} />
                            </div>

                            <div className="dashboard-card-conteudo">
                                <span>
                                    {card.titulo}
                                </span>

                                <strong>
                                    {card.valor}
                                </strong>

                                <small>
                                    {card.descricao}
                                </small>
                            </div>
                        </article>
                    );
                })}
        </section>
    );
}

export default DashboardCards;
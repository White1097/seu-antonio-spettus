function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function Card({ titulo, valor, subtitulo }) {
    return (
        <article className="relatorio-card">
            <span className="relatorio-card-titulo">
                {titulo}
            </span>

            <strong className="relatorio-card-valor">
                {valor}
            </strong>

            {subtitulo && (
                <small className="relatorio-card-subtitulo">
                    {subtitulo}
                </small>
            )}
        </article>
    );
}

export default function RelatorioCards({
    faturamentoTotal = 0,
    quantidadeVendas = 0,
    ticketMedio = 0,
    quantidadeProdutos = 0,
    mesasAtendidas = 0
}) {
    return (
        <section className="relatorio-cards-grid">
            <Card
                titulo="Faturamento"
                valor={formatarMoeda(faturamentoTotal)}
            />

            <Card
                titulo="Vendas"
                valor={quantidadeVendas}
            />

            <Card
                titulo="Ticket Médio"
                valor={formatarMoeda(ticketMedio)}
            />

            <Card
                titulo="Produtos Vendidos"
                valor={quantidadeProdutos}
            />

            <Card
                titulo="Mesas Atendidas"
                valor={mesasAtendidas}
            />
        </section>
    );
}
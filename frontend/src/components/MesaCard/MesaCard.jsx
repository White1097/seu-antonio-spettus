import {
    Clock3,
    UserRound,
    BadgeDollarSign
} from 'lucide-react';

import './MesaCard.css';

function formatarDinheiro(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function obterDataValida(valor) {
    if (!valor) return null;
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
}

function formatarTempoAberto(abertoEm, atualizadoEm, ocupada) {
    if (!ocupada) return 'Disponível para atendimento';
    const data = obterDataValida(abertoEm) || obterDataValida(atualizadoEm);
    if (!data) return 'Aberta recentemente';

    const minutos = Math.max(0, Math.floor((Date.now() - data.getTime()) / 60000));
    if (minutos < 1) return 'Aberta agora';
    if (minutos < 60) return `Aberta há ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return resto ? `Aberta há ${horas}h ${resto}min` : `Aberta há ${horas}h`;
}

function MesaCard({
    numero,
    nome = '',
    cliente = '',
    garcom = '',
    total = 0,
    quantidadeItens = 0,
    ocupada = false,
    abertoEm = null,
    atualizadoEm = null,
    onClick
}) {
    const tempoAberto = formatarTempoAberto(abertoEm, atualizadoEm, ocupada);

    return (
        <button
            type="button"
            className={ocupada ? 'mesa-card ocupada' : 'mesa-card livre'}
            onClick={onClick}
            aria-label={`Abrir ${nome || `Mesa ${numero}`}, ${ocupada ? 'ocupada' : 'livre'}`}
        >
            <div className="mesa-card-topo">
                <div>
                    <span className="mesa-card-numero">{nome || `Mesa ${numero}`}</span>
                    <strong>{ocupada ? 'Em atendimento' : 'Livre'}</strong>
                </div>
                <span className="mesa-card-status" aria-hidden="true" />
            </div>

            <div className="mesa-card-cliente">
                <UserRound size={17} />
                <span>{cliente || (ocupada ? 'Sem cliente informado' : 'Aguardando cliente')}</span>
            </div>

            {ocupada && (
                <div className="mesa-card-garcom">
                    <BadgeDollarSign size={16} />
                    <span>{garcom || 'Atendente não informado'}</span>
                </div>
            )}

            <div className="mesa-card-resumo">
                <div>
                    <small>Itens</small>
                    <strong>{quantidadeItens}</strong>
                </div>
                <div>
                    <small>Total</small>
                    <strong>{formatarDinheiro(total)}</strong>
                </div>
            </div>

            <div className="mesa-card-rodape">
                <Clock3 size={15} />
                <span>{tempoAberto}</span>
            </div>
        </button>
    );
}

export default MesaCard;

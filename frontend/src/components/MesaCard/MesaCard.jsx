import {
    Clock3,
    UserRound
} from 'lucide-react';

import './MesaCard.css';

function formatarDinheiro(valor) {
    return Number(valor || 0).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );
}

function MesaCard({
    numero,
    cliente = '',
    total = 0,
    quantidadeItens = 0,
    ocupada = false,
    atualizadoEm = null,
    onClick
}) {
    function formatarHorario() {
        if (!atualizadoEm) {
            return 'Sem movimentação';
        }

        const data = new Date(atualizadoEm);

        if (Number.isNaN(data.getTime())) {
            return 'Atualização recente';
        }

        return data.toLocaleTimeString(
            'pt-BR',
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );
    }

    return (
        <button
            type="button"
            className={
                ocupada
                    ? 'mesa-card ocupada'
                    : 'mesa-card livre'
            }
            onClick={onClick}
        >
            <div className="mesa-card-topo">
                <div>
                    <span className="mesa-card-numero">
                        Mesa {numero}
                    </span>

                    <strong>
                        {ocupada ? 'Ocupada' : 'Livre'}
                    </strong>
                </div>

                <span className="mesa-card-status" />
            </div>

            <div className="mesa-card-cliente">
                <UserRound size={17} />

                <span>
                    {cliente || 'Sem cliente informado'}
                </span>
            </div>

            <div className="mesa-card-resumo">
                <div>
                    <small>Itens</small>
                    <strong>{quantidadeItens}</strong>
                </div>

                <div>
                    <small>Total</small>
                    <strong>
                        {formatarDinheiro(total)}
                    </strong>
                </div>
            </div>

            <div className="mesa-card-rodape">
                <Clock3 size={15} />

                <span>
                    {formatarHorario()}
                </span>
            </div>
        </button>
    );
}

export default MesaCard;
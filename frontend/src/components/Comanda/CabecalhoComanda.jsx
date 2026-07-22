import {
    ArrowLeft,
    UserRound
} from 'lucide-react';

function CabecalhoComanda({
    numeroMesa,
    cliente,
    atualizarCliente,
    voltarDashboard
}) {
    return (
        <header className="comanda2-cabecalho">
            <div className="comanda2-cabecalho-esquerda">
                <button
                    type="button"
                    className="comanda2-voltar"
                    onClick={voltarDashboard}
                    aria-label="Voltar ao dashboard"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </button>

                <div className="comanda2-titulo">
                    <span>Atendimento</span>

                    <h1>
                        Comanda — Mesa {numeroMesa}
                    </h1>

                    <p>
                        Adicione os produtos escolhidos pelo cliente.
                    </p>
                </div>
            </div>

            <label className="comanda2-cliente">
                <span>
                    <UserRound size={17} />
                    Cliente opcional
                </span>

                <input
                    type="text"
                    value={cliente}
                    onChange={evento =>
                        atualizarCliente(
                            evento.target.value
                        )
                    }
                    placeholder="Nome do cliente"
                    autoComplete="off"
                />
            </label>
        </header>
    );
}

export default CabecalhoComanda;
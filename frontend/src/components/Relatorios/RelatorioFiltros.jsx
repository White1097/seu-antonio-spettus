import { useEffect, useState } from 'react';

function criarDataHoje() {
    return new Date().toISOString().split('T')[0];
}

export default function RelatorioFiltros({
    filtro = 'hoje',
    dataInicial = '',
    dataFinal = '',
    atualizarFiltro,
    carregando = false
}) {
    const [inicioPersonalizado, setInicioPersonalizado] =
        useState(dataInicial);

    const [fimPersonalizado, setFimPersonalizado] =
        useState(dataFinal);

    useEffect(() => {
        setInicioPersonalizado(dataInicial);
        setFimPersonalizado(dataFinal);
    }, [dataInicial, dataFinal]);

    function selecionarFiltro(novoFiltro) {
        atualizarFiltro?.(novoFiltro);
    }

    function aplicarPeriodoPersonalizado() {
        if (!inicioPersonalizado || !fimPersonalizado) {
            window.alert(
                'Informe a data inicial e a data final.'
            );

            return;
        }

        if (
            new Date(
                `${inicioPersonalizado}T00:00:00`
            ) >
            new Date(
                `${fimPersonalizado}T00:00:00`
            )
        ) {
            window.alert(
                'A data inicial não pode ser maior que a data final.'
            );

            return;
        }

        atualizarFiltro?.(
            'personalizado',
            inicioPersonalizado,
            fimPersonalizado
        );
    }

    const filtros = [
        {
            id: 'hoje',
            nome: 'Hoje'
        },
        {
            id: 'ontem',
            nome: 'Ontem'
        },
        {
            id: 'semana',
            nome: 'Esta semana'
        },
        {
            id: 'mes',
            nome: 'Este mês'
        },
        {
            id: 'ultimos30',
            nome: 'Últimos 30 dias'
        }
    ];

    return (
        <section className="relatorio-filtros">
            <div className="relatorio-filtros-cabecalho">
                <div>
                    <span>
                        Período
                    </span>

                    <h3>
                        Filtrar relatório
                    </h3>
                </div>

                <small>
                    Escolha um período rápido ou informe
                    datas personalizadas.
                </small>
            </div>

            <div className="relatorio-filtros-botoes">
                {filtros.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        className={
                            filtro === item.id
                                ? 'relatorio-filtro-botao ativo'
                                : 'relatorio-filtro-botao'
                        }
                        onClick={() =>
                            selecionarFiltro(item.id)
                        }
                        disabled={carregando}
                    >
                        {item.nome}
                    </button>
                ))}
            </div>

            <div
                className={
                    filtro === 'personalizado'
                        ? 'relatorio-periodo-personalizado ativo'
                        : 'relatorio-periodo-personalizado'
                }
            >
                <div className="relatorio-campo-data">
                    <label htmlFor="relatorio-data-inicial">
                        Data inicial
                    </label>

                    <input
                        id="relatorio-data-inicial"
                        type="date"
                        value={inicioPersonalizado}
                        max={
                            fimPersonalizado ||
                            criarDataHoje()
                        }
                        onChange={evento =>
                            setInicioPersonalizado(
                                evento.target.value
                            )
                        }
                        disabled={carregando}
                    />
                </div>

                <div className="relatorio-campo-data">
                    <label htmlFor="relatorio-data-final">
                        Data final
                    </label>

                    <input
                        id="relatorio-data-final"
                        type="date"
                        value={fimPersonalizado}
                        min={inicioPersonalizado}
                        max={criarDataHoje()}
                        onChange={evento =>
                            setFimPersonalizado(
                                evento.target.value
                            )
                        }
                        disabled={carregando}
                    />
                </div>

                <button
                    type="button"
                    className="relatorio-botao-aplicar"
                    onClick={aplicarPeriodoPersonalizado}
                    disabled={carregando}
                >
                    Aplicar período
                </button>
            </div>

            {filtro !== 'personalizado' && (
                <button
                    type="button"
                    className="relatorio-botao-personalizado"
                    onClick={() =>
                        selecionarFiltro(
                            'personalizado'
                        )
                    }
                    disabled={carregando}
                >
                    Usar período personalizado
                </button>
            )}
        </section>
    );
}
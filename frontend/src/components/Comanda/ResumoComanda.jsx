function ResumoComanda({
    subtotal,
    desconto,
    acrescimo,
    atualizarDesconto,
    atualizarAcrescimo,
    aplicarAcrescimo10,
    aplicarDesconto20,
    removerPorcentagens,
    fecharConta,
    itens
}) {

    const total = Math.max(
        subtotal - desconto + acrescimo,
        0
    );

    return (

        <section className="comanda2-resumo">

            <h2>Resumo da conta</h2>

            <div className="comanda2-campo">

                <label>Desconto</label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={desconto}
                    onChange={(e)=>
                        atualizarDesconto(
                            Number(
                                e.target.value || 0
                            )
                        )
                    }
                />

            </div>

            <div className="comanda2-campo">

                <label>Acréscimo</label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={acrescimo}
                    onChange={(e)=>
                        atualizarAcrescimo(
                            Number(
                                e.target.value || 0
                            )
                        )
                    }
                />

            </div>

            <div className="comanda2-botoes">

                <button
                    onClick={aplicarAcrescimo10}
                >
                    +10%
                </button>

                <button
                    onClick={aplicarDesconto20}
                >
                    -20%
                </button>

                <button
                    onClick={removerPorcentagens}
                >
                    Remover %
                </button>

            </div>

            <div className="comanda2-totais">

                <div>

                    <span>Subtotal</span>

                    <strong>

                        {subtotal.toLocaleString(
                            'pt-BR',
                            {
                                style:'currency',
                                currency:'BRL'
                            }
                        )}

                    </strong>

                </div>

                <div>

                    <span>Desconto</span>

                    <strong>

                        {desconto.toLocaleString(
                            'pt-BR',
                            {
                                style:'currency',
                                currency:'BRL'
                            }
                        )}

                    </strong>

                </div>

                <div>

                    <span>Acréscimo</span>

                    <strong>

                        {acrescimo.toLocaleString(
                            'pt-BR',
                            {
                                style:'currency',
                                currency:'BRL'
                            }
                        )}

                    </strong>

                </div>

                <div className="comanda2-total-geral">

                    <span>Total</span>

                    <strong>

                        {total.toLocaleString(
                            'pt-BR',
                            {
                                style:'currency',
                                currency:'BRL'
                            }
                        )}

                    </strong>

                </div>

            </div>

            <button
                className="comanda2-finalizar"
                disabled={itens.length===0}
                onClick={fecharConta}
            >

                Fechar Conta

            </button>

        </section>

    );

}

export default ResumoComanda;
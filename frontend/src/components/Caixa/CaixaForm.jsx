function CaixaForm({
    tipo,
    formulario,
    setFormulario,
    salvando = false
}) {
    function atualizarCampo(campo, valor) {
        setFormulario(estadoAtual => ({
            ...estadoAtual,
            [campo]: valor
        }));
    }

    const tituloValor =
        tipo === 'abrir'
            ? 'Saldo inicial'
            : tipo === 'fechar'
                ? 'Saldo final informado'
                : 'Valor';

    return (
        <div className="caixa-form">
            {tipo !== 'fechar' && <label>
                <span>{tituloValor}</span>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.valor}
                    onChange={evento =>
                        atualizarCampo(
                            'valor',
                            evento.target.value
                        )
                    }
                    placeholder="0,00"
                    disabled={salvando}
                    required
                />
            </label>}

            {(
                tipo === 'suprimento' ||
                tipo === 'sangria'
            ) && (
                <label>
                    <span>Descrição <small>(opcional)</small></span>

                    <textarea
                        value={formulario.descricao}
                        onChange={evento =>
                            atualizarCampo(
                                'descricao',
                                evento.target.value
                            )
                        }
                        placeholder={
                            tipo === 'suprimento'
                                ? 'Ex.: Troco adicionado ao caixa'
                                : 'Ex.: Retirada para pagamento'
                        }
                        rows="4"
                        disabled={salvando}
                    />
                </label>
            )}
        </div>
    );
}

export default CaixaForm;
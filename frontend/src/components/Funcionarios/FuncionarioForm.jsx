function FuncionarioForm({
    formulario,
    setFormulario,
    salvando = false,
    editando = false
}) {
    function atualizarCampo(campo, valor) {
        setFormulario(estadoAtual => ({
            ...estadoAtual,
            [campo]: valor
        }));
    }

    return (
        <div className="funcionario-form">
            <div className="funcionario-form-grid">
                <label>
                    <span>Nome</span>

                    <input
                        type="text"
                        value={formulario.nome}
                        onChange={evento =>
                            atualizarCampo(
                                'nome',
                                evento.target.value
                            )
                        }
                        placeholder="Nome completo"
                        disabled={salvando}
                        required
                    />
                </label>

                <label>
                    <span>E-mail</span>

                    <input
                        type="email"
                        value={formulario.email}
                        onChange={evento =>
                            atualizarCampo(
                                'email',
                                evento.target.value
                            )
                        }
                        placeholder="funcionario@seuantonio.com"
                        disabled={
                            salvando || editando
                        }
                        required
                    />
                </label>

                <label>
                    <span>Cargo</span>

                    <select
                        value={formulario.cargo}
                        onChange={evento =>
                            atualizarCampo(
                                'cargo',
                                evento.target.value
                            )
                        }
                        disabled={salvando}
                        required
                    >
                        <option value="garçom">
                            Garçom
                        </option>

                        <option value="caixa">
                            Caixa
                        </option>

                        <option value="administrador">
                            Administrador
                        </option>
                    </select>
                </label>

                {!editando && (
                    <label>
                        <span>Senha inicial</span>

                        <input
                            type="password"
                            value={formulario.senha}
                            onChange={evento =>
                                atualizarCampo(
                                    'senha',
                                    evento.target.value
                                )
                            }
                            placeholder="Mínimo de 6 caracteres"
                            minLength="6"
                            disabled={salvando}
                            required
                        />
                    </label>
                )}

                <label className="funcionario-form-campo-largo">
                    <span>Avatar</span>

                    <input
                        type="url"
                        value={formulario.avatar}
                        onChange={evento =>
                            atualizarCampo(
                                'avatar',
                                evento.target.value
                            )
                        }
                        placeholder="URL opcional da imagem"
                        disabled={salvando}
                    />
                </label>
            </div>

            <div className="funcionario-form-opcoes">
                <label>
                    <input
                        type="checkbox"
                        checked={formulario.ativo}
                        onChange={evento =>
                            atualizarCampo(
                                'ativo',
                                evento.target.checked
                            )
                        }
                        disabled={salvando}
                    />

                    <span>Funcionário ativo</span>
                </label>
            </div>

            {formulario.avatar && (
                <div className="funcionario-form-preview">
                    <span>Pré-visualização</span>

                    <img
                        src={formulario.avatar}
                        alt="Pré-visualização do funcionário"
                        onError={evento => {
                            evento.currentTarget.style.display =
                                'none';
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default FuncionarioForm;
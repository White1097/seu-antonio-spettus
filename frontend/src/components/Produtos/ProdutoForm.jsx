function ProdutoForm({
    formulario,
    setFormulario,
    categorias = [],
    salvando = false
}) {
    function atualizarCampo(campo, valor) {
        setFormulario(estadoAtual => ({
            ...estadoAtual,
            [campo]: valor
        }));
    }

    return (
        <div className="produto-form">
            <div className="produto-form-grid">
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
                        placeholder="Ex.: Coca-Cola"
                        disabled={salvando}
                        required
                    />
                </label>

                <label>
                    <span>Preço</span>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formulario.preco}
                        onChange={evento =>
                            atualizarCampo(
                                'preco',
                                evento.target.value
                            )
                        }
                        placeholder="0,00"
                        disabled={salvando}
                        required
                    />
                </label>

                <label>
                    <span>Categoria</span>

                    <input
                        type="text"
                        list="categorias-produtos"
                        value={formulario.categoria}
                        onChange={evento =>
                            atualizarCampo(
                                'categoria',
                                evento.target.value
                            )
                        }
                        placeholder="Ex.: Bebidas"
                        disabled={salvando}
                        required
                    />

                    <datalist id="categorias-produtos">
                        {categorias.map(categoria => (
                            <option
                                key={categoria}
                                value={categoria}
                            />
                        ))}
                    </datalist>
                </label>

                <label>
                    <span>Ordem de exibição</span>

                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={formulario.ordem}
                        onChange={evento =>
                            atualizarCampo(
                                'ordem',
                                evento.target.value
                            )
                        }
                        placeholder="Ex.: 1"
                        disabled={salvando}
                    />
                </label>

                <label className="produto-form-campo-largo">
                    <span>Descrição</span>

                    <textarea
                        value={formulario.descricao}
                        onChange={evento =>
                            atualizarCampo(
                                'descricao',
                                evento.target.value
                            )
                        }
                        placeholder="Descrição opcional do produto"
                        disabled={salvando}
                        rows="4"
                    />
                </label>

                <label className="produto-form-campo-largo">
                    <span>Imagem</span>

                    <input
                        type="url"
                        value={formulario.imagem}
                        onChange={evento =>
                            atualizarCampo(
                                'imagem',
                                evento.target.value
                            )
                        }
                        placeholder="Cole a URL da imagem"
                        disabled={salvando}
                    />
                </label>
            </div>

            <div className="produto-form-opcoes">
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

                    <span>Produto disponível</span>
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={formulario.destaque}
                        onChange={evento =>
                            atualizarCampo(
                                'destaque',
                                evento.target.checked
                            )
                        }
                        disabled={salvando}
                    />

                    <span>Produto em destaque</span>
                </label>
            </div>

            {formulario.imagem && (
                <div className="produto-form-preview">
                    <span>Pré-visualização</span>

                    <img
                        src={formulario.imagem}
                        alt="Pré-visualização do produto"
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

export default ProdutoForm;
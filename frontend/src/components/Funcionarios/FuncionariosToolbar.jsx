import {
    Plus,
    Search,
    SlidersHorizontal
} from 'lucide-react';

function FuncionariosToolbar({
    busca,
    setBusca,
    cargo,
    setCargo,
    mostrarInativos,
    setMostrarInativos,
    abrirNovoFuncionario
}) {
    return (
        <section className="funcionarios-toolbar">
            <div className="funcionarios-toolbar-esquerda">
                <label className="funcionarios-toolbar-busca">
                    <Search size={18} />

                    <input
                        type="search"
                        value={busca}
                        onChange={evento =>
                            setBusca(evento.target.value)
                        }
                        placeholder="Pesquisar funcionário..."
                    />
                </label>

                <label className="funcionarios-toolbar-filtro">
                    <SlidersHorizontal size={18} />

                    <select
                        value={cargo}
                        onChange={evento =>
                            setCargo(evento.target.value)
                        }
                    >
                        <option value="todos">
                            Todos os cargos
                        </option>

                        <option value="administrador">
                            Administrador
                        </option>

                        <option value="caixa">
                            Caixa
                        </option>

                        <option value="garçom">
                            Garçom
                        </option>
                    </select>
                </label>

                <label className="funcionarios-toolbar-inativos">
                    <input
                        type="checkbox"
                        checked={mostrarInativos}
                        onChange={evento =>
                            setMostrarInativos(
                                evento.target.checked
                            )
                        }
                    />

                    <span>
                        Mostrar inativos
                    </span>
                </label>
            </div>

            <button
                type="button"
                className="funcionarios-toolbar-novo"
                onClick={abrirNovoFuncionario}
            >
                <Plus size={19} />
                Novo funcionário
            </button>
        </section>
    );
}

export default FuncionariosToolbar;
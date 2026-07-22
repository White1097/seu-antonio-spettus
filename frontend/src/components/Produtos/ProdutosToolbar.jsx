import {
    Plus,
    Search,
    SlidersHorizontal
} from 'lucide-react';

function ProdutosToolbar({
    busca,
    setBusca,
    categoria,
    setCategoria,
    categorias = [],
    mostrarInativos,
    setMostrarInativos,
    abrirNovoProduto
}) {
    return (
        <section className="produtos-toolbar">
            <div className="produtos-toolbar-esquerda">
                <label className="produtos-toolbar-busca">
                    <Search size={18} />

                    <input
                        type="search"
                        value={busca}
                        onChange={evento =>
                            setBusca(evento.target.value)
                        }
                        placeholder="Pesquisar produto..."
                    />
                </label>

                <label className="produtos-toolbar-filtro">
                    <SlidersHorizontal size={18} />

                    <select
                        value={categoria}
                        onChange={evento =>
                            setCategoria(evento.target.value)
                        }
                    >
                        <option value="todas">
                            Todas as categorias
                        </option>

                        {categorias.map(item => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="produtos-toolbar-inativos">
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
                        Mostrar indisponíveis
                    </span>
                </label>
            </div>

            <button
                type="button"
                className="produtos-toolbar-novo"
                onClick={abrirNovoProduto}
            >
                <Plus size={19} />
                Novo produto
            </button>
        </section>
    );
}

export default ProdutosToolbar;
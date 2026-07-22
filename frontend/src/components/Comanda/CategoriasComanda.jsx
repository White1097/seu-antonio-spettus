import { useRef } from 'react';

function CategoriasComanda({
    categorias,
    categoriaAtiva,
    selecionarCategoria
}) {
    const categoriasRef = useRef(null);

    function rolarCategorias(evento) {
        const elemento = categoriasRef.current;

        if (!elemento || Math.abs(evento.deltaY) <= Math.abs(evento.deltaX)) {
            return;
        }

        if (elemento.scrollWidth <= elemento.clientWidth) {
            return;
        }

        evento.preventDefault();
        elemento.scrollLeft += evento.deltaY;
    }

    return (
        <nav
            ref={categoriasRef}
            className="comanda2-categorias"
            aria-label="Categorias de produtos"
            onWheel={rolarCategorias}
        >
            <button
                type="button"
                className={
                    categoriaAtiva === 'todos'
                        ? 'comanda2-categoria ativa'
                        : 'comanda2-categoria'
                }
                onClick={() => selecionarCategoria('todos')}
            >
                Todos
            </button>

            {categorias.map(categoria => (
                <button
                    key={categoria}
                    type="button"
                    className={
                        categoriaAtiva === categoria
                            ? 'comanda2-categoria ativa'
                            : 'comanda2-categoria'
                    }
                    onClick={() => selecionarCategoria(categoria)}
                >
                    {categoria}
                </button>
            ))}
        </nav>
    );
}

export default CategoriasComanda;

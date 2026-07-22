function CategoriasComanda({
    categorias,
    categoriaAtiva,
    selecionarCategoria
}) {
    return (
        <nav
            className="comanda2-categorias"
            aria-label="Categorias de produtos"
        >
            <button
                type="button"
                className={
                    categoriaAtiva === 'todos'
                        ? 'comanda2-categoria ativa'
                        : 'comanda2-categoria'
                }
                onClick={() =>
                    selecionarCategoria('todos')
                }
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
                    onClick={() =>
                        selecionarCategoria(categoria)
                    }
                >
                    {categoria}
                </button>
            ))}
        </nav>
    );
}

export default CategoriasComanda;
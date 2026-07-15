import { useState } from 'react';

import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';

import './Layout.css';

function Layout({
    paginaAtual,
    mudarPagina,
    titulo,
    children
}) {

    const [menuAberto, setMenuAberto] =
        useState(false);

    return (
        <div className="layout">

            <Sidebar
                paginaAtual={paginaAtual}
                mudarPagina={mudarPagina}
                aberta={menuAberto}
                fecharNoMobile={() =>
                    setMenuAberto(false)
                }
            />

            <div className="layout-conteudo">

                <Topbar
                    titulo={titulo}
                    abrirMenu={() =>
                        setMenuAberto(true)
                    }
                />

                <main className="layout-main">

                    {children}

                </main>

            </div>

        </div>
    );
}

export default Layout;
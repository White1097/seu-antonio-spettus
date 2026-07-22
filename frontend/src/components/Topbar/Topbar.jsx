import {
    Menu,
    Moon,
    Sun
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Topbar.css';

function formatarCargo(cargo) {
    const cargos = {
        garçom: 'Garçom',
        caixa: 'Caixa',
        administrador: 'Administrador'
    };

    return cargos[cargo] || 'Funcionário';
}

function Topbar({
    abrirMenu,
    titulo = 'Dashboard'
}) {
    const { perfil, cargo } = useAuth();
    const { temaEscuro, alternarTema, logoUrl, nomeSistema } = useTheme();
    const hora = new Date().getHours();

    let saudacao = 'Boa noite';

    if (hora < 12) {
        saudacao = 'Bom dia';
    } else if (hora < 18) {
        saudacao = 'Boa tarde';
    }

    return (
        <header className="topbar">
            <div className="topbar-esquerda">
                <button
                    className="topbar-menu"
                    onClick={abrirMenu}
                    type="button"
                    aria-label="Abrir menu"
                >
                    <Menu size={23} />
                </button>

                <div className="topbar-titulo">
                    <span className="topbar-saudacao">
                        {saudacao},
                    </span>
                    <h1>{titulo}</h1>
                </div>
            </div>

            <div className="topbar-direita">
                <button
                    className="topbar-tema"
                    type="button"
                    onClick={alternarTema}
                    aria-label={temaEscuro
                        ? 'Ativar tema claro'
                        : 'Ativar tema escuro'}
                    title={temaEscuro
                        ? 'Ativar tema claro'
                        : 'Ativar tema escuro'}
                >
                    {temaEscuro
                        ? <Sun size={20} />
                        : <Moon size={20} />}
                </button>

                <div className="topbar-usuario">
                    <div className="topbar-avatar">
                        <img
                            src={logoUrl}
                            alt={nomeSistema}
                        />
                    </div>

                    <div className="topbar-usuario-info">
                        <strong>
                            {perfil?.nome || 'Funcionário'}
                        </strong>
                        <span>{formatarCargo(cargo)}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Topbar;
